import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('prisma migration discipline', () => {
  it('requires a migration for GoalContribution.kind support', () => {
    const schema = readFileSync(join(process.cwd(), 'prisma/schema.prisma'), 'utf8')
    const migrations = readdirSync(join(process.cwd(), 'prisma/migrations'))
    const goalMovementMigration = migrations.find((entry) =>
      entry.includes('goal_movement_kind'),
    )
    const migrationSql = goalMovementMigration
      ? readFileSync(
          join(process.cwd(), 'prisma/migrations', goalMovementMigration, 'migration.sql'),
          'utf8',
        )
      : ''

    expect(schema).toContain('kind                 GoalMovementKind')
    expect(goalMovementMigration).toBeDefined()
    expect(migrationSql).toContain('ALTER TABLE `GoalContribution`')
    expect(migrationSql).toContain('DROP COLUMN `reflectFinancially`')
    expect(migrationSql).toContain(
      "ADD COLUMN `kind` ENUM('CONTRIBUTION', 'WITHDRAWAL', 'ADJUSTMENT') NOT NULL DEFAULT 'CONTRIBUTION'",
    )
  })
})
