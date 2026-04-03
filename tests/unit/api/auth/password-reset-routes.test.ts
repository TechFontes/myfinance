import { beforeEach, describe, expect, it, vi } from "vitest"
import bcrypt from "bcryptjs"
import { NextRequest } from "next/server"
import {
  findUserByEmail,
  findUserByResetToken,
  updateUserById,
} from "@/services/userService"

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
  },
}))

vi.mock("@/services/userService", () => ({
  findUserByEmail: vi.fn(),
  findUserByResetToken: vi.fn(),
  updateUserById: vi.fn(),
}))

describe("password reset routes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("creates a reset token for an existing user", async () => {
    vi.mocked(findUserByEmail).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
    } as never)
    vi.mocked(updateUserById).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
    } as never)

    const { POST } = await import("@/api/auth/password/request-reset/route")
    const response = await POST(
      new NextRequest("http://localhost/api/auth/password/request-reset", {
        method: "POST",
        body: JSON.stringify({ email: "user@example.com" }),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(updateUserById).toHaveBeenCalled()
  })

  it("resets password with valid token", async () => {
    vi.mocked(findUserByResetToken).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      resetToken: "token-123",
      resetTokenExpiry: new Date(Date.now() + 60_000),
      tokenVersion: 0,
    } as never)
    vi.mocked(bcrypt.hash).mockResolvedValue("new-hash" as never)
    vi.mocked(updateUserById).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
    } as never)

    const { POST } = await import("@/api/auth/password/reset/route")
    const response = await POST(
      new NextRequest("http://localhost/api/auth/password/reset", {
        method: "POST",
        body: JSON.stringify({
          token: "token-123",
          password: "12345678",
          confirmPassword: "12345678",
        }),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(bcrypt.hash).toHaveBeenCalledWith("12345678", 10)
  })
})
