import { describe, it, expect, vi, beforeEach } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  transaction: { findFirst: vi.fn(), update: vi.fn() },
  account: { findFirst: vi.fn() },
}))
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/modules/financial-core/invariants', () => ({
  assertUserOwnsAccount: vi.fn(),
  assertUserOwnsCreditCard: vi.fn(),
  assertInvoiceBelongsToCreditCard: vi.fn(),
}))

import { settleTransactionForUser, cancelTransactionForUser } from '@/modules/transactions/service'

describe('settleTransactionForUser', () => {
  beforeEach(() => vi.clearAllMocks())

  it('settles a PLANNED transaction with account and paidAt', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue({ id: 10, userId: 'user-1', status: 'PLANNED' })
    prismaMock.account.findFirst.mockResolvedValue({ id: 1, userId: 'user-1' })
    prismaMock.transaction.update.mockResolvedValue({ id: 10, status: 'PAID', accountId: 1, paidAt: new Date('2026-04-02') })

    const result = await settleTransactionForUser('user-1', 10, { accountId: 1, paidAt: new Date('2026-04-02') })
    expect(result).not.toBeNull()
    expect(prismaMock.transaction.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { status: 'PAID', accountId: 1, paidAt: new Date('2026-04-02') },
    })
  })

  it('rejects settlement of PAID transaction', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue({ id: 10, userId: 'user-1', status: 'PAID' })
    await expect(settleTransactionForUser('user-1', 10, { accountId: 1, paidAt: new Date() })).rejects.toThrow()
  })

  it('rejects settlement of CANCELED transaction', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue({ id: 10, userId: 'user-1', status: 'CANCELED' })
    await expect(settleTransactionForUser('user-1', 10, { accountId: 1, paidAt: new Date() })).rejects.toThrow()
  })

  it('rejects when user does not own account', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue({ id: 10, userId: 'user-1', status: 'PLANNED' })
    prismaMock.account.findFirst.mockResolvedValue(null)
    await expect(settleTransactionForUser('user-1', 10, { accountId: 999, paidAt: new Date() })).rejects.toThrow()
  })

  it('returns null when transaction not found', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue(null)
    const result = await settleTransactionForUser('user-1', 999, { accountId: 1, paidAt: new Date() })
    expect(result).toBeNull()
  })
})

describe('cancelTransactionForUser', () => {
  beforeEach(() => vi.clearAllMocks())

  it('cancels a PLANNED transaction', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue({ id: 10, userId: 'user-1', status: 'PLANNED', paidAt: null })
    prismaMock.transaction.update.mockResolvedValue({ id: 10, status: 'CANCELED' })
    const result = await cancelTransactionForUser('user-1', 10)
    expect(result).not.toBeNull()
    expect(prismaMock.transaction.update).toHaveBeenCalledWith({ where: { id: 10 }, data: { status: 'CANCELED' } })
  })

  it('cancels a PAID transaction preserving paidAt (only changes status)', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue({ id: 10, userId: 'user-1', status: 'PAID', paidAt: new Date('2026-03-15') })
    prismaMock.transaction.update.mockResolvedValue({ id: 10, status: 'CANCELED' })
    const result = await cancelTransactionForUser('user-1', 10)
    expect(result).not.toBeNull()
    expect(prismaMock.transaction.update).toHaveBeenCalledWith({ where: { id: 10 }, data: { status: 'CANCELED' } })
  })

  it('rejects cancellation of already CANCELED', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue({ id: 10, userId: 'user-1', status: 'CANCELED' })
    await expect(cancelTransactionForUser('user-1', 10)).rejects.toThrow()
  })

  it('returns null when not found', async () => {
    prismaMock.transaction.findFirst.mockResolvedValue(null)
    const result = await cancelTransactionForUser('user-1', 999)
    expect(result).toBeNull()
  })
})
