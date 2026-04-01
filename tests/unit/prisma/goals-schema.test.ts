import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const schema = readFileSync('prisma/schema.prisma', 'utf8')

describe('goals prisma schema', () => {
  it('declares a goal model with owner, target and optional reserve account', () => {
    expect(schema).toContain('model Goal {')
    expect(schema).toMatch(/userId\s+String/)
    expect(schema).toMatch(/name\s+String/)
    expect(schema).toMatch(/targetAmount\s+Decimal/)
    expect(schema).toMatch(/status\s+GoalStatus/)
    expect(schema).toMatch(/reserveAccountId\s+Int\?/)
    expect(schema).toMatch(/createdAt\s+DateTime\s+@default\(now\(\)\)/)
    expect(schema).toMatch(/updatedAt\s+DateTime\s+@updatedAt/)
  })

  it('declares a goal contribution model for manual progress and optional financial reflection', () => {
    expect(schema).toContain('model GoalContribution {')
    expect(schema).toMatch(/goalId\s+Int/)
    expect(schema).toMatch(/amount\s+Decimal/)
    expect(schema).toMatch(/reflectFinancially\s+Boolean\s+@default\(false\)/)
    expect(schema).toMatch(/createdAt\s+DateTime\s+@default\(now\(\)\)/)
    expect(schema).toMatch(/goal\s+Goal\s+@relation\(fields: \[goalId\], references: \[id\]\)/)
  })
})
