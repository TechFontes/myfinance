import { beforeEach, describe, expect, it, vi } from "vitest"
import bcrypt from "bcryptjs"
import { NextRequest } from "next/server"
import { signAuthToken } from "@/lib/auth"
import { createUser } from "@/services/userService"

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
  },
}))

vi.mock("@/lib/auth", () => ({
  signAuthToken: vi.fn(),
}))

vi.mock("@/services/userService", () => ({
  createUser: vi.fn(),
}))

describe("register route sets auth cookie", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("sets the auth_token cookie on successful registration", async () => {
    vi.mocked(createUser).mockResolvedValue({
      id: "user-1",
      name: "User",
      email: "user@example.com",
      password: "hashed",
      role: "USER",
      tokenVersion: 0,
      blockedAt: null,
      blockedReason: null,
      resetToken: null,
      resetTokenExpires: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed" as never)
    vi.mocked(signAuthToken).mockReturnValue("test-jwt-token")

    const { POST } = await import("@/api/auth/register/route")
    const request = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "User",
        email: "user@example.com",
        password: "12345678",
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(signAuthToken).toHaveBeenCalledWith({
      sub: "user-1",
      email: "user@example.com",
      role: "USER",
      tokenVersion: 0,
    })

    const cookie = response.cookies.get("auth_token")
    expect(cookie).toBeDefined()
    expect(cookie?.value).toBe("test-jwt-token")
  }, 20000)

  it("returns user data including role", async () => {
    vi.mocked(createUser).mockResolvedValue({
      id: "user-1",
      name: "User",
      email: "user@example.com",
      password: "hashed",
      role: "USER",
      tokenVersion: 0,
      blockedAt: null,
      blockedReason: null,
      resetToken: null,
      resetTokenExpires: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed" as never)
    vi.mocked(signAuthToken).mockReturnValue("test-jwt-token")

    const { POST } = await import("@/api/auth/register/route")
    const request = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "User",
        email: "user@example.com",
        password: "12345678",
      }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(body.user.role).toBe("USER")
  }, 20000)
})
