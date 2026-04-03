import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}))

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
  },
}))

vi.mock("@/services/userService", () => ({
  findUserById: vi.fn(),
  findUserByResetToken: vi.fn(),
  updateUserById: vi.fn(),
}))

import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { NextRequest } from "next/server"
import { signAuthToken, verifyAuthToken } from "@/modules/auth"
import { getUserFromRequest } from "@/lib/auth"
import {
  findUserById,
  findUserByResetToken,
  updateUserById,
} from "@/services/userService"

describe("token versioning", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("includes tokenVersion in the signed JWT payload", () => {
    const token = signAuthToken({
      sub: "user-1",
      email: "user@example.com",
      role: "USER",
      tokenVersion: 3,
    })

    const decoded = verifyAuthToken(token)
    expect(decoded.tokenVersion).toBe(3)
  })

  it("rejects token with outdated tokenVersion", async () => {
    const token = signAuthToken({
      sub: "user-1",
      email: "user@example.com",
      role: "USER",
      tokenVersion: 0,
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
      tokenVersion: 1,
      blockedAt: null,
      blockedReason: null,
      resetToken: null,
      resetTokenExpiry: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)

    const user = await getUserFromRequest()
    expect(user).toBeNull()
  })

  it("accepts token with matching tokenVersion", async () => {
    const token = signAuthToken({
      sub: "user-1",
      email: "user@example.com",
      role: "USER",
      tokenVersion: 2,
    })

    vi.mocked(cookies).mockResolvedValue({
      get: () => ({ value: token }),
    } as never)

    const mockUser = {
      id: "user-1",
      email: "user@example.com",
      name: "User",
      password: "hashed",
      role: "USER",
      tokenVersion: 2,
      blockedAt: null,
      blockedReason: null,
      resetToken: null,
      resetTokenExpiry: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(findUserById).mockResolvedValue(mockUser as never)

    const user = await getUserFromRequest()
    expect(user).toEqual(mockUser)
  })

  it("password reset increments tokenVersion in update call", async () => {
    vi.mocked(findUserByResetToken).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      resetToken: "reset-token",
      resetTokenExpiry: new Date(Date.now() + 60_000),
      tokenVersion: 5,
    } as never)
    vi.mocked(updateUserById).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      tokenVersion: 6,
    } as never)
    vi.mocked(bcrypt.hash).mockResolvedValue("new-hash" as never)

    const { POST } = await import("@/api/auth/password/reset/route")

    const request = new NextRequest("http://localhost/api/auth/password/reset", {
      method: "POST",
      body: JSON.stringify({
        token: "reset-token",
        password: "12345678",
        confirmPassword: "12345678",
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    expect(updateUserById).toHaveBeenCalledWith("user-1", {
      password: "new-hash",
      resetToken: null,
      resetTokenExpiry: null,
      tokenVersion: 6,
    })
  })
})
