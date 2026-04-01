import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const schema = readFileSync('prisma/schema.prisma', 'utf8')

describe('transfers prisma schema alignment', () => {
  it('stores a dedicated transfer model with source and destination accounts', () => {
    expect(schema).toContain('model Transfer {')
    expect(schema).toMatch(/sourceAccountId\s+Int/)
    expect(schema).toMatch(/destinationAccountId\s+Int/)
    expect(schema).toMatch(/amount\s+Decimal/)
    expect(schema).toContain('competenceDate')
    expect(schema).toContain('dueDate')
    expect(schema).toContain('paidAt')
  })

  it('stores manual transfer statuses separate from transactions', () => {
    expect(schema).toContain('enum TransferStatus {')
    expect(schema).toContain('PLANNED')
    expect(schema).toContain('PENDING')
    expect(schema).toContain('PAID')
    expect(schema).toContain('CANCELED')
  })
})
