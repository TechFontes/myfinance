import { describe, expect, it } from 'vitest'
import {
  transferStatuses,
  transferCreateSchema,
  transferUpdateSchema,
} from '@/modules/transfers'

describe('transfers module foundation', () => {
  it('exports supported transfer statuses', () => {
    expect(transferStatuses).toEqual(['PLANNED', 'PENDING', 'PAID', 'CANCELED'])
  })

  it('validates transfer creation payloads with source and destination accounts', () => {
    const payload = transferCreateSchema.parse({
      sourceAccountId: 1,
      destinationAccountId: 2,
      amount: '150.00',
      description: 'Reserva mensal',
      competenceDate: '2026-03-31',
      dueDate: '2026-04-01',
    })

    expect(payload).toMatchObject({
      sourceAccountId: 1,
      destinationAccountId: 2,
      amount: '150.00',
      description: 'Reserva mensal',
      competenceDate: '2026-03-31',
      dueDate: '2026-04-01',
    })
  })

  it('validates transfer updates with manual status changes', () => {
    const payload = transferUpdateSchema.parse({
      status: 'PAID',
      paidAt: '2026-03-31',
    })

    expect(payload).toMatchObject({
      status: 'PAID',
      paidAt: '2026-03-31',
    })
  })
})
