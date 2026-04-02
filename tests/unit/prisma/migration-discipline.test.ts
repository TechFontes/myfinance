import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('prisma migration discipline', () => {
  it('requires a migration for GoalContribution.kind support', () => {
    const schema = readFileSync(join(process.cwd(), 'prisma/schema.prisma'), 'utf8')
    const migrations = readdirSync(join(process.cwd(), 'prisma/migrations'))

    expect(schema).toContain('kind                 GoalMovementKind')
    expect(migrations.some((entry) => entry.includes('goal_movement_kind'))).toBe(true)
  })
})
