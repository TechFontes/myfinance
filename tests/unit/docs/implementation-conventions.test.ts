import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"

describe("implementation conventions", () => {
  it("documents TDD and module boundaries", () => {
    const file = readFileSync(
      "docs/superpowers/plans/notes/implementation-conventions.md",
      "utf8",
    )

    expect(file).toContain("TDD")
    expect(file).toContain("app/modules")
    expect(file).toContain("pages do not talk to Prisma directly")
  })
})
