import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const dbTypes = readFileSync("app/types/db.ts", "utf8")

describe("transaction db types", () => {
  it("describe the PRD transaction fields", () => {
    expect(dbTypes).toContain("competenceDate")
    expect(dbTypes).toContain("dueDate")
    expect(dbTypes).toContain("paidAt")
    expect(dbTypes).toContain("TransactionFilters")
    expect(dbTypes).toContain("page?: number")
    expect(dbTypes).toContain("pageSize?: number")
  })
})
