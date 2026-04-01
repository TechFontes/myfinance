import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const schema = readFileSync('prisma/schema.prisma', 'utf8')

describe('invoices and installments prisma schema alignment', () => {
  it('stores invoice fields required by the PRD', () => {
    expect(schema).toContain('enum InvoiceStatus')
    expect(schema).toContain('model Invoice {')
    expect(schema).toMatch(/status\s+InvoiceStatus\s+@default\(OPEN\)/)
    expect(schema).toMatch(/dueDate\s+DateTime/)
    expect(schema).toMatch(/createdAt\s+DateTime\s+@default\(now\(\)\)/)
    expect(schema).toMatch(/updatedAt\s+DateTime\s+@updatedAt/)
  })

  it('stores installment grouping fields on transactions', () => {
    expect(schema).toContain('installmentGroupId String?')
    expect(schema).toContain('installment     Int?')
    expect(schema).toContain('installments    Int?')
  })
})
