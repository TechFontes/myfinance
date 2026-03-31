import { describe, expect, it } from "vitest"
import { transactionStatuses, transactionKinds } from "@/types/domain"

describe("domain types", () => {
  it("defines the approved transaction statuses from the PRD", () => {
    expect(transactionStatuses).toEqual([
      "PLANNED",
      "PENDING",
      "PAID",
      "CANCELED",
    ])
  })

  it("defines supported financial operation kinds", () => {
    expect(transactionKinds).toContain("EXPENSE")
    expect(transactionKinds).toContain("INCOME")
    expect(transactionKinds).toContain("TRANSFER")
  })
})
