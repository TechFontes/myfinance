import { beforeEach, describe, expect, it, vi } from "vitest"
import bcrypt from "bcryptjs"
import { NextRequest } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { updateUserById } from "@/services/userService"

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}))

vi.mock("@/lib/auth", () => ({
  getUserFromRequest: vi.fn(),
}))

vi.mock("@/services/userService", () => ({
  updateUserById: vi.fn(),
}))

describe("profile route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getUserFromRequest).mockResolvedValue({
      id: "user-1",
      name: "User",
      email: "user@example.com",
      password: "hashed",
      role: "USER",
      blockedAt: null,
      blockedReason: null,
      resetToken: null,
      resetTokenExpires: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)
  })

  it("updates profile name", async () => {
    vi.mocked(updateUserById).mockResolvedValue({
      id: "user-1",
      name: "Updated User",
      email: "user@example.com",
    } as never)

    const { PATCH } = await import("@/api/auth/profile/route")
    const response = await PATCH(
      new NextRequest("http://localhost/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({ name: "Updated User" }),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.user.name).toBe("Updated User")
    expect(updateUserById).toHaveBeenCalledWith("user-1", { name: "Updated User" })
  })

  it("requires current password to change email", async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

    const { PATCH } = await import("@/api/auth/profile/route")
    const response = await PATCH(
      new NextRequest("http://localhost/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({
          email: "new@example.com",
          currentPassword: "wrong-pass",
        }),
      }),
    )

    expect(response.status).toBe(400)
  })

  it("changes password when current password and confirmation are valid", async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
    vi.mocked(bcrypt.hash).mockResolvedValue("new-hash" as never)
    vi.mocked(updateUserById).mockResolvedValue({
      id: "user-1",
      name: "User",
      email: "user@example.com",
    } as never)

    const { PATCH } = await import("@/api/auth/profile/route")
    const response = await PATCH(
      new NextRequest("http://localhost/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: "123456",
          newPassword: "12345678",
          confirmPassword: "12345678",
        }),
      }),
    )

    expect(response.status).toBe(200)
    expect(bcrypt.hash).toHaveBeenCalledWith("12345678", 10)
  })
})
