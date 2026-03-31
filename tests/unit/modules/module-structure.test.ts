import { describe, expect, it } from "vitest"
import * as auth from "@/modules/auth"
import * as transactions from "@/modules/transactions"

describe("module boundaries", () => {
  it("exposes module entrypoints", () => {
    expect(auth).toBeDefined()
    expect(transactions).toBeDefined()
  })
})
