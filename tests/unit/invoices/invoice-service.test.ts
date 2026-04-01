import { describe, expect, it } from 'vitest'
import {
  buildInvoiceDueDate,
  createInstallmentGroupId,
  normalizeInvoicePeriod,
} from '@/modules/invoices/service'

describe('invoice service helpers', () => {
  it('builds a stable due date for the invoice period', () => {
    expect(buildInvoiceDueDate(2026, 4, 20)).toEqual(new Date('2026-04-20T00:00:00.000Z'))
  })

  it('normalizes the invoice period', () => {
    expect(normalizeInvoicePeriod(4, 2026)).toEqual({
      month: 4,
      year: 2026,
    })
  })

  it('creates distinct installment group ids', () => {
    const first = createInstallmentGroupId()
    const second = createInstallmentGroupId()

    expect(first).toMatch(/^[0-9a-f-]{36}$/)
    expect(second).toMatch(/^[0-9a-f-]{36}$/)
    expect(first).not.toBe(second)
  })
})
