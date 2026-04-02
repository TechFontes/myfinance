import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('prisma migration discipline', () => {
  it('requires a migration for GoalContribution.kind support', () => {
    const schema = readFileSync(join(process.cwd(), 'prisma/schema.prisma'), 'utf8')
    const migrationHistory = readdirSync(join(process.cwd(), 'prisma/migrations'))
      .filter((entry) => entry !== 'migration_lock.toml')
      .sort()
      .map((entry) =>
        readFileSync(join(process.cwd(), 'prisma/migrations', entry, 'migration.sql'), 'utf8'),
      )
      .join('\n')
      .replace(/\s+/g, ' ')
      .trim()

    expect(schema).toContain('kind                 GoalMovementKind')
    expect(schema).not.toContain('reflectFinancially')
    expect(migrationHistory).toContain('`reflectFinancially` BOOLEAN NOT NULL DEFAULT false')
    expect(migrationHistory).toMatch(
      /ALTER TABLE `GoalContribution` .*DROP COLUMN `reflectFinancially`.*ADD COLUMN `kind` ENUM\('CONTRIBUTION', 'WITHDRAWAL', 'ADJUSTMENT'\) NOT NULL DEFAULT 'CONTRIBUTION'/,
    )
  })
})
