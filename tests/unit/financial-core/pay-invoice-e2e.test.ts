import { describe, it, expect, vi, beforeEach } from 'vitest'

const prismaMock = {
  invoice: { findFirst: vi.fn(), update: vi.fn() },
  account: { findFirst: vi.fn() },
  transaction: { create: vi.fn() },
  $transaction: vi.fn(),
}
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock, default: prismaMock }))

import { payInvoiceForUserE2E } from '@/modules/invoices/service'

describe('payInvoiceForUserE2E', () => {
  beforeEach(() => vi.clearAllMocks())

  it('marks invoice as PAID and creates expense transaction atomically', async () => {
    prismaMock.invoice.findFirst.mockResolvedValue({
      id: 10, creditCardId: 3, month: 4, year: 2026, status: 'OPEN',
      dueDate: new Date('2026-04-10'),
      creditCard: { id: 3, userId: 'user-1', name: 'Nubank' },
      transactions: [
        { id: 1, value: { toNumber: () => 800 }, status: 'PENDING' },
        { id: 2, value: { toNumber: () => 400 }, status: 'PENDING' },
      ],
    })
    prismaMock.account.findFirst.mockResolvedValue({ id: 1, userId: 'user-1' })
    prismaMock.$transaction.mockImplementation(async (fn) => fn(prismaMock))
    prismaMock.invoice.update.mockResolvedValue({ id: 10, status: 'PAID' })
    prismaMock.transaction.create.mockResolvedValue({ id: 99, type: 'EXPENSE', status: 'PAID' })

    const result = await payInvoiceForUserE2E('user-1', 10, { accountId: 1, paidAt: new Date('2026-04-10') })
    expect(result).not.toBeNull()
    expect(prismaMock.invoice.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 10 }, data: expect.objectContaining({ status: 'PAID' }),
    }))
    expect(prismaMock.transaction.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ type: 'EXPENSE', status: 'PAID', accountId: 1, invoiceId: 10 }),
    }))
  })

  it('rejects payment of non-OPEN invoice', async () => {
    prismaMock.invoice.findFirst.mockResolvedValue({
      id: 10, status: 'PAID', creditCard: { id: 3, userId: 'user-1' },
    })
    await expect(payInvoiceForUserE2E('user-1', 10, { accountId: 1, paidAt: new Date() })).rejects.toThrow()
  })

  it('rejects when user does not own account', async () => {
    prismaMock.invoice.findFirst.mockResolvedValue({
      id: 10, status: 'OPEN', dueDate: new Date('2026-04-10'),
      creditCard: { id: 3, userId: 'user-1', name: 'Nubank' },
      transactions: [],
    })
    prismaMock.account.findFirst.mockResolvedValue(null)
    await expect(payInvoiceForUserE2E('user-1', 10, { accountId: 999, paidAt: new Date() })).rejects.toThrow()
  })

  it('returns null when invoice not found', async () => {
    prismaMock.invoice.findFirst.mockResolvedValue(null)
    const result = await payInvoiceForUserE2E('user-1', 999, { accountId: 1, paidAt: new Date() })
    expect(result).toBeNull()
  })
})
