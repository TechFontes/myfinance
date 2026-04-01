import { beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import {
  createTransaction,
  listTransactionsByUser,
} from '@/services/transactionServer'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    transaction: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe('legacy transaction server wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps competenceDate to date for legacy dashboard callers', async () => {
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([
      {
        id: 1,
        competenceDate: new Date('2026-03-01T00:00:00.000Z'),
      },
    ] as never)

    const transactions = await listTransactionsByUser('user-1')

    expect(prisma.transaction.findMany).toHaveBeenCalled()
    expect(transactions[0].date).toEqual(new Date('2026-03-01T00:00:00.000Z'))
  })

  it('accepts the legacy create payload and forwards a normalized transaction', async () => {
    vi.mocked(prisma.transaction.create).mockResolvedValue({
      id: 1,
      competenceDate: new Date('2026-03-01T00:00:00.000Z'),
    } as never)

    await createTransaction({
      user: { connect: { id: 'user-1' } },
      type: 'EXPENSE',
      description: 'Internet',
      value: '129.90',
      categoryId: 12,
      competenceDate: new Date('2026-03-01T00:00:00.000Z'),
      dueDate: new Date('2026-03-10T00:00:00.000Z'),
    })

    expect(prisma.transaction.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        type: 'EXPENSE',
        description: 'Internet',
        value: '129.90',
        categoryId: 12,
        accountId: null,
        creditCardId: null,
        invoiceId: null,
        competenceDate: new Date('2026-03-01T00:00:00.000Z'),
        dueDate: new Date('2026-03-10T00:00:00.000Z'),
        paidAt: null,
        status: 'PLANNED',
        fixed: false,
        installment: null,
        installments: null,
      },
    })
  })
})
