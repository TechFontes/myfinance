import { describe, expect, it } from "vitest"
import { loginInputSchema } from "@/modules/auth"

describe("loginInputSchema password validation", () => {
  it("rejects passwords shorter than 8 characters", () => {
    const result = loginInputSchema.safeParse({
      email: "user@example.com",
      password: "1234567",
    })

    expect(result.success).toBe(false)
  })

  it("accepts passwords with exactly 8 characters", () => {
    const result = loginInputSchema.safeParse({
      email: "user@example.com",
      password: "12345678",
    })

    expect(result.success).toBe(true)
  })

  it("accepts passwords longer than 8 characters", () => {
    const result = loginInputSchema.safeParse({
      email: "user@example.com",
      password: "a-very-long-password",
    })

    expect(result.success).toBe(true)
  })
})
