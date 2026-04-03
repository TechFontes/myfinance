import { describe, it, expect, vi, beforeEach } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  account: { findFirst: vi.fn() },
  transaction: { aggregate: vi.fn() },
  transfer: { aggregate: vi.fn() },
}))

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))

import { computeAccountBalance } from '@/modules/accounts/service'

describe('computeAccountBalance', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns initialBalance when no transactions or transfers exist', async () => {
    prismaMock.account.findFirst.mockResolvedValue({
      id: 1, userId: 'user-1',
      initialBalance: { toNumber: () => 1000 },
    })
    prismaMock.transaction.aggregate.mockResolvedValue({ _sum: { value: null } })
    prismaMock.transfer.aggregate.mockResolvedValue({ _sum: { amount: null } })

    const result = await computeAccountBalance('user-1', 1)
    expect(result).toBe('1000.00')
  })

  it('adds paid income and subtracts paid expense with transfers', async () => {
    prismaMock.account.findFirst.mockResolvedValue({
      id: 1, userId: 'user-1',
      initialBalance: { toNumber: () => 1000 },
    })
    prismaMock.transaction.aggregate.mockImplementation(({ where }) => {
      if (where.type === 'INCOME') return Promise.resolve({ _sum: { value: { toNumber: () => 500 } } })
      if (where.type === 'EXPENSE') return Promise.resolve({ _sum: { value: { toNumber: () => 200 } } })
      return Promise.resolve({ _sum: { value: null } })
    })
    prismaMock.transfer.aggregate.mockImplementation(({ where }) => {
      if (where.destinationAccountId) return Promise.resolve({ _sum: { amount: { toNumber: () => 300 } } })
      if (where.sourceAccountId) return Promise.resolve({ _sum: { amount: { toNumber: () => 100 } } })
      return Promise.resolve({ _sum: { amount: null } })
    })

    const result = await computeAccountBalance('user-1', 1)
    expect(result).toBe('1500.00') // 1000 + 500 - 200 + 300 - 100
  })

  it('only considers PAID status transactions', async () => {
    prismaMock.account.findFirst.mockResolvedValue({
      id: 1, userId: 'user-1',
      initialBalance: { toNumber: () => 500 },
    })
    prismaMock.transaction.aggregate.mockResolvedValue({ _sum: { value: null } })
    prismaMock.transfer.aggregate.mockResolvedValue({ _sum: { amount: null } })

    await computeAccountBalance('user-1', 1)

    const txCalls = prismaMock.transaction.aggregate.mock.calls
    for (const call of txCalls) {
      expect(call[0].where.status).toBe('PAID')
    }
    const trCalls = prismaMock.transfer.aggregate.mock.calls
    for (const call of trCalls) {
      expect(call[0].where.status).toBe('PAID')
    }
  })

  it('returns null when account not found', async () => {
    prismaMock.account.findFirst.mockResolvedValue(null)
    const result = await computeAccountBalance('user-1', 999)
    expect(result).toBeNull()
  })
})
