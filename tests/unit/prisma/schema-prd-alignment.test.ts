import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"

const schema = readFileSync("prisma/schema.prisma", "utf8")

describe("schema PRD alignment", () => {
  it("includes separate financial dates and role support", () => {
    expect(schema).toContain("enum UserRole")
    expect(schema).toContain("competenceDate")
    expect(schema).toContain("dueDate")
    expect(schema).toContain("paidAt")
  })
})
