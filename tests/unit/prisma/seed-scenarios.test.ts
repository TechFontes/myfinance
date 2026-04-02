import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'

describe('seed scenario coverage', () => {
  const seed = readFileSync('prisma/seed.ts', 'utf8')

  it('defines a six-month seeded scenario across the main financial modules', () => {
    // Six months of data (Jan-Jun 2026)
    expect(seed).toContain('2026-01')
    expect(seed).toContain('2026-02')
    expect(seed).toContain('2026-03')
    expect(seed).toContain('2026-04')
    expect(seed).toContain('2026-05')
    expect(seed).toContain('2026-06')

    // Credit card support
    expect(seed).toContain('creditCard')
    expect(seed).toContain('invoice')

    // Recurring rules
    expect(seed).toContain('recurringRule')

    // Goals with contributions
    expect(seed).toContain('goal')
    expect(seed).toContain('goalContribution')

    // Transfers
    expect(seed).toContain('transfer')

    // Nested categories
    expect(seed).toContain('parentId')

    // Multiple transaction statuses
    expect(seed).toContain('PAID')
    expect(seed).toContain('PENDING')
    expect(seed).toContain('PLANNED')
    expect(seed).toContain('CANCELED')
  })
})
