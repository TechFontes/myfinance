import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

describe('goals schema', () => {
  it('models goal contributions with explicit movement kind and positive amount semantics', () => {
    const schema = readFileSync(join(process.cwd(), 'prisma/schema.prisma'), 'utf8')

    expect(schema).toContain('enum GoalMovementKind')
    expect(schema).toContain('CONTRIBUTION')
    expect(schema).toContain('WITHDRAWAL')
    expect(schema).toContain('ADJUSTMENT')
    expect(schema).toContain('kind                 GoalMovementKind')
    expect(schema).not.toContain('reflectFinancially')
  })
})
