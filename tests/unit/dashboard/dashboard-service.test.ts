import { beforeEach, describe, expect, it, vi } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  transaction: {
    findMany: vi.fn(),
    groupBy: vi.fn(),
  },
  account: {
    findMany: vi.fn(),
  },
  transfer: {
    findMany: vi.fn(),
  },
  invoice: {
    findMany: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

vi.setConfig({
  testTimeout: 15000,
  hookTimeout: 15000,
})

describe('dashboard service alignment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('queries transactions by competenceDate for the monthly summary', async () => {
    const { getFinanceSummary } = await import('@/services/dashboardService')

    prismaMock.transaction.findMany.mockResolvedValueOnce([
      { type: 'INCOME', value: '100.00' },
      { type: 'EXPENSE', value: '25.00' },
    ])

    await getFinanceSummary('user-1', '2026-03')

    expect(prismaMock.transaction.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        userId: 'user-1',
        status: { not: 'CANCELED' },
        competenceDate: {
          gte: expect.any(Date),
          lte: expect.any(Date),
        },
      }),
    })
  })

  it('groups categories by competenceDate for the monthly totals', async () => {
    const { getCategoryTotals } = await import('@/services/dashboardService')

    prismaMock.transaction.groupBy.mockResolvedValueOnce([])

    await getCategoryTotals('user-1', '2026-03')

    expect(prismaMock.transaction.groupBy).toHaveBeenCalledWith({
      by: ['categoryId'],
      where: expect.objectContaining({
        userId: 'user-1',
        status: { not: 'CANCELED' },
        competenceDate: {
          gte: expect.any(Date),
          lte: expect.any(Date),
        },
      }),
      _sum: { value: true },
      orderBy: { _sum: { value: 'desc' } },
    })
  })

  it('lists available months from competenceDate values', async () => {
    const { getAvailableMonths } = await import('@/services/dashboardService')

    prismaMock.transaction.findMany.mockResolvedValueOnce([
      { competenceDate: new Date('2026-01-10T00:00:00.000Z') },
      { competenceDate: new Date('2026-03-02T00:00:00.000Z') },
    ])
    prismaMock.transfer.findMany.mockResolvedValueOnce([
      { competenceDate: new Date('2026-02-14T00:00:00.000Z') },
    ])
    prismaMock.invoice.findMany.mockResolvedValueOnce([
      { dueDate: new Date('2026-04-20T00:00:00.000Z') },
    ])

    await expect(getAvailableMonths('user-1')).resolves.toEqual([
      '2026-01',
      '2026-02',
      '2026-03',
      '2026-04',
    ])

    expect(prismaMock.transaction.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', status: { not: 'CANCELED' } },
      select: { competenceDate: true },
    })
    expect(prismaMock.transfer.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', status: { not: 'CANCELED' } },
      select: { competenceDate: true },
    })
    expect(prismaMock.invoice.findMany).toHaveBeenCalledWith({
      where: {
        creditCard: {
          userId: 'user-1',
        },
      },
      select: { dueDate: true },
    })
  })

  it('returns a consolidated dashboard report with forecast, realized and pending sections', async () => {
    const { getDashboardReport } = await import('@/services/dashboardService')

    prismaMock.transaction.findMany.mockResolvedValueOnce([
      {
        id: 1,
        type: 'INCOME',
        description: 'Salary',
        value: '1000.00',
        competenceDate: new Date('2026-03-05T00:00:00.000Z'),
        dueDate: new Date('2026-03-05T00:00:00.000Z'),
        paidAt: new Date('2026-03-05T00:00:00.000Z'),
        status: 'PAID',
        categoryId: 10,
        category: { id: 10, name: 'Income', type: 'INCOME' },
      },
      {
        id: 2,
        type: 'EXPENSE',
        description: 'Rent',
        value: '300.00',
        competenceDate: new Date('2026-03-10T00:00:00.000Z'),
        dueDate: new Date('2026-03-15T00:00:00.000Z'),
        paidAt: null,
        status: 'PENDING',
        categoryId: 11,
        category: { id: 11, name: 'Housing', type: 'EXPENSE' },
      },
      {
        id: 3,
        type: 'EXPENSE',
        description: 'Groceries',
        value: '150.00',
        competenceDate: new Date('2026-03-20T00:00:00.000Z'),
        dueDate: new Date('2026-03-20T00:00:00.000Z'),
        paidAt: null,
        status: 'PLANNED',
        categoryId: 11,
        category: { id: 11, name: 'Housing', type: 'EXPENSE' },
      },
      {
        id: 4,
        type: 'EXPENSE',
        description: 'Canceled item',
        value: '999.00',
        competenceDate: new Date('2026-03-20T00:00:00.000Z'),
        dueDate: new Date('2026-03-20T00:00:00.000Z'),
        paidAt: null,
        status: 'CANCELED',
        categoryId: 11,
        category: { id: 11, name: 'Housing', type: 'EXPENSE' },
      },
    ])
    prismaMock.account.findMany.mockResolvedValueOnce([
      {
        id: 7,
        name: 'Main account',
        type: 'BANK',
        initialBalance: '500.00',
        active: true,
      },
    ])
    prismaMock.transfer.findMany.mockResolvedValueOnce([
      {
        id: 20,
        description: 'Move to savings',
        amount: '200.00',
        competenceDate: new Date('2026-03-12T00:00:00.000Z'),
        dueDate: new Date('2026-03-12T00:00:00.000Z'),
        paidAt: null,
        status: 'PENDING',
        sourceAccount: { name: 'Main account' },
        destinationAccount: { name: 'Savings' },
      },
    ])
    prismaMock.invoice.findMany.mockResolvedValueOnce([
      {
        id: 30,
        month: 3,
        year: 2026,
        status: 'OPEN',
        dueDate: new Date('2026-03-25T00:00:00.000Z'),
        total: '999.99',
        creditCard: { id: 8, name: 'Card one' },
        transactions: [
          { id: 1, value: '200.00', status: 'OPEN' },
          { id: 2, value: '250.00', status: 'OPEN' },
          { id: 3, value: '50.00', status: 'CANCELED' },
        ],
      },
    ])

    const report = await getDashboardReport('user-1', '2026-03')

    expect(report.summary).toMatchObject({
      forecastIncome: '0.00',
      forecastExpense: '450.00',
      realizedIncome: '1000.00',
      realizedExpense: '0.00',
      forecastBalance: '-450.00',
      realizedBalance: '1000.00',
    })
    expect(report.pending).toHaveLength(3)
    expect(report.accounts).toEqual([
      expect.objectContaining({ name: 'Main account', active: true }),
    ])
    expect(report.categories).toEqual([
      expect.objectContaining({ categoryName: 'Income' }),
      expect.objectContaining({ categoryName: 'Housing' }),
    ])
    expect(report.cardInvoices).toEqual([
      expect.objectContaining({ cardName: 'Card one', total: '450.00' }),
    ])
    expect(report.transfers).toEqual([
      expect.objectContaining({ sourceAccountName: 'Main account', destinationAccountName: 'Savings' }),
    ])
  })

  it('queries the dashboard report with minimal selected fields instead of broad includes', async () => {
    const { getDashboardReport } = await import('@/services/dashboardService')

    prismaMock.transaction.findMany.mockResolvedValueOnce([])
    prismaMock.transfer.findMany.mockResolvedValueOnce([])
    prismaMock.invoice.findMany.mockResolvedValueOnce([])
    prismaMock.account.findMany.mockResolvedValueOnce([])

    await getDashboardReport('user-1', '2026-03')

    expect(prismaMock.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          id: true,
          type: true,
          description: true,
          value: true,
          status: true,
          competenceDate: true,
          dueDate: true,
          categoryId: true,
          category: expect.any(Object),
          account: expect.any(Object),
        }),
      }),
    )
    expect(prismaMock.transaction.findMany).not.toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.anything(),
      }),
    )

    expect(prismaMock.transfer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          id: true,
          description: true,
          amount: true,
          competenceDate: true,
          dueDate: true,
          status: true,
          sourceAccount: expect.any(Object),
          destinationAccount: expect.any(Object),
        }),
      }),
    )
    expect(prismaMock.invoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          id: true,
          month: true,
          year: true,
          status: true,
          total: true,
          dueDate: true,
          creditCard: expect.any(Object),
          transactions: expect.any(Object),
        }),
      }),
    )
    expect(prismaMock.account.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        type: true,
        initialBalance: true,
        active: true,
      },
    })
  })
})
