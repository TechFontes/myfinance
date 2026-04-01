import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const schema = readFileSync('prisma/schema.prisma', 'utf8')
const recurringRuleBlock = schema.match(/model RecurringRule \{[\s\S]*?\n\}/)?.[0] ?? ''

describe('recurrence schema alignment', () => {
  it('stores the base recurrence fields required by the PRD', () => {
    expect(recurringRuleBlock).toContain('model RecurringRule {')
    expect(recurringRuleBlock).toContain('userId         String')
    expect(recurringRuleBlock).toContain('type           TransactionType')
    expect(recurringRuleBlock).toContain('description    String')
    expect(recurringRuleBlock).toContain('value          Decimal         @db.Decimal(10, 2)')
    expect(recurringRuleBlock).toContain('categoryId     Int')
    expect(recurringRuleBlock).toContain('accountId      Int?')
    expect(recurringRuleBlock).toContain('creditCardId   Int?')
    expect(recurringRuleBlock).toContain('frequency      String')
    expect(recurringRuleBlock).toContain('dayOfMonth     Int?')
    expect(recurringRuleBlock).toContain('startDate      DateTime')
    expect(recurringRuleBlock).toContain('endDate        DateTime?')
    expect(recurringRuleBlock).toContain('active         Boolean         @default(true)')
    expect(recurringRuleBlock).toContain('createdAt      DateTime        @default(now())')
    expect(recurringRuleBlock).toContain('updatedAt      DateTime        @updatedAt')
  })

  it('keeps recurrence linked to generated transactions', () => {
    expect(recurringRuleBlock).toContain('transactions   Transaction[]')
  })
})
