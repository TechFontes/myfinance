import { beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import {
  countTransactionsByUser,
  createTransactionForUser,
  listTransactionsByUser,
  updateTransactionByUser,
} from '@/modules/transactions/service'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    transaction: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    account: {
      findFirst: vi.fn(),
    },
    creditCard: {
      findFirst: vi.fn(),
    },
    invoice: {
      findFirst: vi.fn(),
    },
  },
}))

describe('transactions service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists transactions by user with PRD filters, relations and ordering', async () => {
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([] as never)

    await listTransactionsByUser('user-1', {
      search: 'internet',
      type: 'EXPENSE',
      status: 'PENDING',
      categoryId: 12,
      accountId: 3,
      creditCardId: 8,
      periodStart: new Date('2026-03-01T00:00:00.000Z'),
      periodEnd: new Date('2026-03-31T23:59:59.000Z'),
      page: 2,
      pageSize: 25,
    })

    expect(prisma.transaction.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        type: 'EXPENSE',
        status: 'PENDING',
        categoryId: 12,
        accountId: 3,
        creditCardId: 8,
        competenceDate: {
          gte: new Date('2026-03-01T00:00:00.000Z'),
          lte: new Date('2026-03-31T23:59:59.000Z'),
        },
        OR: [
          {
            description: {
              contains: 'internet',
              mode: 'insensitive',
            },
          },
          {
            category: {
              name: {
                contains: 'internet',
                mode: 'insensitive',
              },
            },
          },
        ],
      },
      orderBy: [
        { competenceDate: 'desc' },
        { dueDate: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        category: true,
        account: true,
        creditCard: true,
        invoice: true,
      },
      skip: 25,
      take: 25,
    })
  })

  it('creates a transaction with PRD defaults', async () => {
    vi.mocked(prisma.transaction.create).mockResolvedValue({
      id: 1,
      userId: 'user-1',
      type: 'EXPENSE',
      accountId: null,
      creditCardId: null,
      invoiceId: null,
      categoryId: 12,
      description: 'Internet',
      value: '129.90',
      competenceDate: new Date('2026-03-01T00:00:00.000Z'),
      dueDate: new Date('2026-03-10T00:00:00.000Z'),
      paidAt: null,
      status: 'PLANNED',
      fixed: false,
      recurringRuleId: null,
      installment: null,
      installments: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)

    await createTransactionForUser('user-1', {
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

  it('updates a transaction only for its owner', async () => {
    vi.mocked(prisma.transaction.findFirst).mockResolvedValue({
      id: 10,
      userId: 'user-1',
      type: 'EXPENSE',
      description: 'Internet',
      value: { toString: () => '129.90' },
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
    } as never)
    vi.mocked(prisma.transaction.update).mockResolvedValue({
      id: 10,
      userId: 'user-1',
      type: 'EXPENSE',
      accountId: null,
      creditCardId: null,
      invoiceId: null,
      categoryId: 12,
      description: 'Internet atualizado',
      value: '149.90',
      competenceDate: new Date('2026-03-01T00:00:00.000Z'),
      dueDate: new Date('2026-03-15T00:00:00.000Z'),
      paidAt: null,
      status: 'PENDING',
      fixed: true,
      recurringRuleId: null,
      installment: null,
      installments: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)

    const updated = await updateTransactionByUser('user-1', 10, {
      description: 'Internet atualizado',
      value: '149.90',
      dueDate: new Date('2026-03-15T00:00:00.000Z'),
      status: 'PENDING',
      fixed: true,
    })

    expect(prisma.transaction.findFirst).toHaveBeenCalledWith({
      where: { id: 10, userId: 'user-1' },
    })
    expect(prisma.transaction.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: {
        description: 'Internet atualizado',
        value: '149.90',
        competenceDate: undefined,
        dueDate: new Date('2026-03-15T00:00:00.000Z'),
        paidAt: undefined,
        status: 'PENDING',
        categoryId: undefined,
        accountId: undefined,
        creditCardId: undefined,
        invoiceId: undefined,
        fixed: true,
        installment: undefined,
        installments: undefined,
      },
    })
    expect(updated?.description).toBe('Internet atualizado')
  })

  it('returns null when updating a missing transaction', async () => {
    vi.mocked(prisma.transaction.findFirst).mockResolvedValue(null)

    const updated = await updateTransactionByUser('user-1', 10, {
      description: 'Internet atualizado',
    })

    expect(updated).toBeNull()
    expect(prisma.transaction.update).not.toHaveBeenCalled()
  })

  it('allows explicit null updates to remove card and invoice links', async () => {
    vi.mocked(prisma.account.findFirst).mockResolvedValue({
      id: 3,
      userId: 'user-1',
    } as never)
    vi.mocked(prisma.transaction.findFirst).mockResolvedValue({
      id: 11,
      userId: 'user-1',
      type: 'EXPENSE',
      description: 'Compra no cartao',
      value: { toString: () => '199.90' },
      categoryId: 12,
      accountId: null,
      creditCardId: 8,
      invoiceId: 21,
      competenceDate: new Date('2026-03-01T00:00:00.000Z'),
      dueDate: new Date('2026-03-10T00:00:00.000Z'),
      paidAt: null,
      status: 'PENDING',
      fixed: false,
      installment: null,
      installments: null,
    } as never)
    vi.mocked(prisma.transaction.update).mockResolvedValue({
      id: 11,
      userId: 'user-1',
      type: 'EXPENSE',
      description: 'Compra migrada para conta',
      value: '199.90',
      categoryId: 12,
      accountId: 3,
      creditCardId: null,
      invoiceId: null,
      competenceDate: new Date('2026-03-01T00:00:00.000Z'),
      dueDate: new Date('2026-03-10T00:00:00.000Z'),
      paidAt: null,
      status: 'PENDING',
      fixed: false,
      recurringRuleId: null,
      installment: null,
      installments: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)

    const updated = await updateTransactionByUser('user-1', 11, {
      accountId: 3,
      creditCardId: null,
      invoiceId: null,
      description: 'Compra migrada para conta',
    })

    expect(prisma.transaction.update).toHaveBeenCalledWith({
      where: { id: 11 },
      data: {
        description: 'Compra migrada para conta',
        accountId: 3,
        creditCardId: null,
        invoiceId: null,
        type: undefined,
        value: undefined,
        categoryId: undefined,
        competenceDate: undefined,
        dueDate: undefined,
        paidAt: undefined,
        status: undefined,
        fixed: undefined,
        installment: undefined,
        installments: undefined,
      },
    })
    expect(prisma.account.findFirst).toHaveBeenCalledWith({
      where: { id: 3, userId: 'user-1' },
      select: { id: true },
    })
    expect(updated?.creditCardId).toBeNull()
    expect(updated?.invoiceId).toBeNull()
  })

  it('builds a count query with the same transaction filters', async () => {
    vi.mocked(prisma.transaction.count).mockResolvedValue(7)

    const total = await countTransactionsByUser('user-1', {
      search: 'internet',
      status: 'PAID',
      page: 3,
      pageSize: 10,
    })

    expect(prisma.transaction.count).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        status: 'PAID',
        OR: [
          {
            description: {
              contains: 'internet',
              mode: 'insensitive',
            },
          },
          {
            category: {
              name: {
                contains: 'internet',
                mode: 'insensitive',
              },
            },
          },
        ],
      },
    })
    expect(total).toBe(7)
  })
})
