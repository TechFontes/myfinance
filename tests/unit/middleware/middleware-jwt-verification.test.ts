import { describe, expect, it } from "vitest"
import { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { signAuthToken } from "@/modules/auth"
import { middleware } from "@/middleware"

function makeExpiredToken() {
  return jwt.sign(
    { sub: "user-1", email: "user@test.com", role: "USER", tokenVersion: 0 },
    process.env.JWT_SECRET || "dev-secret-not-for-production",
    { expiresIn: "-1s" }
  )
}

function makeForgedToken() {
  return jwt.sign(
    { sub: "user-1", email: "user@test.com", role: "USER", tokenVersion: 0 },
    "wrong-secret",
    { expiresIn: "7d" }
  )
}

function makeValidToken() {
  return signAuthToken({
    sub: "user-1",
    email: "user@test.com",
    role: "USER",
    tokenVersion: 0,
  })
}

describe("middleware JWT verification for all protected routes", () => {
  describe("dashboard routes", () => {
    it("redirects to login when token is missing", () => {
      const req = new NextRequest("http://localhost/dashboard")
      const res = middleware(req)

      expect(res.status).toBe(307)
      expect(res.headers.get("location")).toContain("/login")
    })

    it("redirects to login when token is expired", () => {
      const req = new NextRequest("http://localhost/dashboard")
      req.cookies.set("auth_token", makeExpiredToken())

      const res = middleware(req)

      expect(res.status).toBe(307)
      expect(res.headers.get("location")).toContain("/login")
      expect(res.headers.get("location")).toContain("callbackUrl=%2Fdashboard")
    })

    it("redirects to login when token is forged", () => {
      const req = new NextRequest("http://localhost/dashboard/settings")
      req.cookies.set("auth_token", makeForgedToken())

      const res = middleware(req)

      expect(res.status).toBe(307)
      expect(res.headers.get("location")).toContain("/login")
    })

    it("allows through with valid token", () => {
      const req = new NextRequest("http://localhost/dashboard")
      req.cookies.set("auth_token", makeValidToken())

      const res = middleware(req)

      expect(res.status).toBe(200)
    })
  })

  describe("protected API routes", () => {
    it("returns 401 when token is missing", () => {
      const req = new NextRequest("http://localhost/api/accounts")
      const res = middleware(req)

      expect(res.status).toBe(401)
    })

    it("returns 401 when token is expired", () => {
      const req = new NextRequest("http://localhost/api/accounts")
      req.cookies.set("auth_token", makeExpiredToken())

      const res = middleware(req)

      expect(res.status).toBe(401)
    })

    it("returns 401 when token is forged", () => {
      const req = new NextRequest("http://localhost/api/accounts")
      req.cookies.set("auth_token", makeForgedToken())

      const res = middleware(req)

      expect(res.status).toBe(401)
    })

    it("allows through with valid token", () => {
      const req = new NextRequest("http://localhost/api/accounts")
      req.cookies.set("auth_token", makeValidToken())

      const res = middleware(req)

      expect(res.status).toBe(200)
    })
  })

  describe("public routes are not affected", () => {
    it("allows public API routes without token", () => {
      const req = new NextRequest("http://localhost/api/auth/login")
      const res = middleware(req)

      expect(res.status).toBe(200)
    })
  })
})
