import { describe, expect, it } from "vitest"
import { NextRequest } from "next/server"
import { signAuthToken } from "@/modules/auth"
import { middleware } from "@/middleware"

describe("auth middleware", () => {
  it("redirects unauthenticated dashboard access to login", () => {
    const request = new NextRequest("http://localhost/dashboard")
    const response = middleware(request)

    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toContain("/login")
  })

  it("returns 401 for private api without token", () => {
    const request = new NextRequest("http://localhost/api/accounts")
    const response = middleware(request)

    expect(response.status).toBe(401)
  })

  it("blocks non-admin users from admin routes", () => {
    const token = signAuthToken({
      sub: "user-1",
      email: "user@example.com",
      role: "USER",
    })

    const request = new NextRequest("http://localhost/admin")
    request.cookies.set("auth_token", token)

    const response = middleware(request)
    expect(response.status).toBe(307)
  })

  it("allows admin users into admin routes", () => {
    const token = signAuthToken({
      sub: "admin-1",
      email: "admin@example.com",
      role: "ADMIN",
    })

    const request = new NextRequest("http://localhost/admin")
    request.cookies.set("auth_token", token)

    const response = middleware(request)
    expect(response.status).toBe(200)
  })
})
