import { beforeEach, describe, expect, it, vi } from "vitest"
import bcrypt from "bcryptjs"
import { NextRequest } from "next/server"
import { getUserFromRequest, signAuthToken } from "@/lib/auth"
import { createUser, findUserByEmail } from "@/services/userService"

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}))

vi.mock("@/lib/auth", () => ({
  signAuthToken: vi.fn(),
  getUserFromRequest: vi.fn(),
}))

vi.mock("@/services/userService", () => ({
  findUserByEmail: vi.fn(),
  createUser: vi.fn(),
}))

describe("auth routes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("registers a new user", async () => {
    vi.mocked(createUser).mockResolvedValue({
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
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed" as never)

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

    expect(response.status).toBe(201)
    expect(body.user.email).toBe("user@example.com")
  }, 20000)

  it("logs in a valid user", async () => {
    vi.mocked(findUserByEmail).mockResolvedValue({
      id: "user-1",
      name: "User",
      email: "user@example.com",
      password: "hashed",
      role: "USER",
    } as never)
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
    vi.mocked(signAuthToken).mockReturnValue("token")

    const { POST } = await import("@/api/auth/login/route")
    const request = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "user@example.com",
        password: "123456",
      }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.user.email).toBe("user@example.com")
    expect(signAuthToken).toHaveBeenCalled()
  })

  it("returns null user when session is absent", async () => {
    vi.mocked(getUserFromRequest).mockResolvedValue(null)

    const { GET } = await import("@/api/auth/me/route")
    const response = await GET(new NextRequest("http://localhost/api/auth/me"))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(response.headers.get("cache-control")).toBe("no-store")
    expect(body.user).toBeNull()
  })

  it("clears the auth cookie on logout", async () => {
    const { POST } = await import("@/api/auth/logout/route")
    const response = await POST(new NextRequest("http://localhost/api/auth/logout", { method: "POST" }))

    expect(response.status).toBe(200)
    expect(response.cookies.get("auth_token")?.value).toBe("")
  })
})
