import { describe, expect, it } from "vitest"
import * as auth from "@/modules/auth"
import * as dashboard from "@/modules/dashboard"
import * as transactions from "@/modules/transactions"

describe("module boundaries", () => {
  it("exposes module entrypoints", () => {
    expect(auth).toBeDefined()
    expect(dashboard).toBeDefined()
    expect(transactions).toBeDefined()
  })
})
