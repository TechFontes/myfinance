import { describe, expect, it } from "vitest"
import {
  authTokenCookieName,
  loginInputSchema,
  registerInputSchema,
  signAuthToken,
  verifyAuthToken,
} from "@/modules/auth"

describe("auth foundation", () => {
  it("signs and verifies auth token payloads", () => {
    const token = signAuthToken({
      sub: "user-1",
      email: "user@example.com",
      role: "USER",
      tokenVersion: 0,
    })

    expect(typeof token).toBe("string")
    expect(authTokenCookieName).toBe("auth_token")

    const payload = verifyAuthToken(token)
    expect(payload).toMatchObject({
      sub: "user-1",
      email: "user@example.com",
      role: "USER",
    })
  })

  it("validates login input", () => {
    const parsed = loginInputSchema.parse({
      email: "user@example.com",
      password: "12345678",
    })

    expect(parsed.email).toBe("user@example.com")
  })

  it("validates register input", () => {
    const parsed = registerInputSchema.parse({
      name: "User",
      email: "user@example.com",
      password: "12345678",
    })

    expect(parsed.name).toBe("User")
  })
})
