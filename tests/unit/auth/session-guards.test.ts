import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}))

vi.mock("@/services/userService", () => ({
  findUserById: vi.fn(),
}))

import { cookies } from "next/headers"
import { signAuthToken } from "@/modules/auth"
import { getUserFromRequest } from "@/lib/auth"
import { findUserById } from "@/services/userService"

describe("auth session guards", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns null for blocked users", async () => {
    const token = signAuthToken({
      sub: "user-1",
      email: "user@example.com",
      role: "USER",
    })

    vi.mocked(cookies).mockResolvedValue({
      get: () => ({ value: token }),
    } as never)

    vi.mocked(findUserById).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      name: "User",
      password: "hashed",
      role: "USER",
      blockedAt: new Date(),
      blockedReason: "manual block",
      resetToken: null,
      resetTokenExpires: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)

    const user = await getUserFromRequest()
    expect(user).toBeNull()
  })
})
