import { describe, expect, it } from 'vitest'
import {
  invoiceCreateSchema,
  invoiceStatuses,
  installmentPlanSchema,
} from '@/modules/invoices'

describe('invoice contracts', () => {
  it('exports supported invoice statuses', () => {
    expect(invoiceStatuses).toEqual(['OPEN', 'PAID', 'CANCELED'])
  })

  it('validates invoice creation payloads', () => {
    const payload = invoiceCreateSchema.parse({
      creditCardId: 7,
      month: 4,
      year: 2026,
      dueDate: '2026-04-20',
      status: 'OPEN',
      total: '250.00',
    })

    expect(payload).toMatchObject({
      creditCardId: 7,
      month: 4,
      year: 2026,
      dueDate: new Date('2026-04-20'),
      status: 'OPEN',
      total: '250.00',
    })
  })

  it('validates installment plan payloads', () => {
    const payload = installmentPlanSchema.parse({
      installmentGroupId: 'group-1',
      installment: 2,
      installments: 12,
    })

    expect(payload).toMatchObject({
      installmentGroupId: 'group-1',
      installment: 2,
      installments: 12,
    })
  })
})
