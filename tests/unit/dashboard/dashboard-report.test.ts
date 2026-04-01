import { beforeEach, describe, expect, it, vi } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  account: {
    findMany: vi.fn(),
  },
  invoice: {
    findMany: vi.fn(),
  },
  transaction: {
    findMany: vi.fn(),
  },
  transfer: {
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

describe('dashboard report aggregation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('builds a consolidated monthly report from transactions, transfers, invoices and accounts', async () => {
    const { getDashboardReport } = await import('@/services/dashboardService')

    prismaMock.transaction.findMany.mockResolvedValueOnce([
      {
        id: 1,
        type: 'INCOME',
        description: 'Salary',
        value: '100.00',
        status: 'PLANNED',
        dueDate: new Date('2026-03-05T00:00:00.000Z'),
        competenceDate: new Date('2026-03-01T00:00:00.000Z'),
        category: { id: 10, name: 'Salary', type: 'INCOME' },
        account: { id: 1, name: 'Main', type: 'BANK' },
      },
      {
        id: 2,
        type: 'EXPENSE',
        description: 'Groceries',
        value: '25.00',
        status: 'PAID',
        dueDate: new Date('2026-03-10T00:00:00.000Z'),
        competenceDate: new Date('2026-03-08T00:00:00.000Z'),
        category: { id: 11, name: 'Food', type: 'EXPENSE' },
        account: { id: 1, name: 'Main', type: 'BANK' },
      },
      {
        id: 3,
        type: 'EXPENSE',
        description: 'Cancelled',
        value: '12.00',
        status: 'CANCELED',
        dueDate: new Date('2026-03-12T00:00:00.000Z'),
        competenceDate: new Date('2026-03-12T00:00:00.000Z'),
        category: { id: 11, name: 'Food', type: 'EXPENSE' },
        account: { id: 1, name: 'Main', type: 'BANK' },
      },
    ])

    prismaMock.transfer.findMany.mockResolvedValueOnce([
      {
        id: 4,
        description: 'Reserve transfer',
        amount: '40.00',
        status: 'PENDING',
        competenceDate: new Date('2026-03-15T00:00:00.000Z'),
        dueDate: new Date('2026-03-16T00:00:00.000Z'),
        sourceAccount: { id: 1, name: 'Main' },
        destinationAccount: { id: 2, name: 'Reserve' },
      },
    ])

    prismaMock.invoice.findMany.mockResolvedValueOnce([
      {
        id: 8,
        month: 3,
        year: 2026,
        status: 'OPEN',
        total: '120.00',
        dueDate: new Date('2026-03-20T00:00:00.000Z'),
        creditCard: { id: 7, name: 'Visa' },
        transactions: [
          { id: 21, description: 'Laptop installment', installment: 1, installments: 3 },
        ],
      },
    ])

    prismaMock.account.findMany.mockResolvedValueOnce([
      { id: 1, name: 'Main', type: 'BANK', initialBalance: '1000.00', active: true },
      { id: 2, name: 'Reserve', type: 'WALLET', initialBalance: '250.00', active: true },
    ])

    const report = await getDashboardReport('user-1', '2026-03')

    expect(report.period).toMatchObject({
      mode: 'MONTHLY',
      month: '2026-03',
    })
    expect(report.summary).toEqual({
      forecastIncome: '100.00',
      forecastExpense: '0.00',
      realizedIncome: '0.00',
      realizedExpense: '25.00',
      forecastBalance: '100.00',
      realizedBalance: '-25.00',
    })
    expect(report.pending).toHaveLength(2)
    expect(report.accounts).toEqual([
      {
        id: 1,
        name: 'Main',
        type: 'BANK',
        balance: '975.00',
        active: true,
      },
      {
        id: 2,
        name: 'Reserve',
        type: 'WALLET',
        balance: '250.00',
        active: true,
      },
    ])
    expect(report.categories).toEqual([
      {
        categoryId: 10,
        categoryName: 'Salary',
        type: 'INCOME',
        total: '100.00',
      },
      {
        categoryId: 11,
        categoryName: 'Food',
        type: 'EXPENSE',
        total: '25.00',
      },
    ])
    expect(report.cardInvoices).toEqual([
      {
        invoiceId: 8,
        cardId: 7,
        cardName: 'Visa',
        month: 3,
        year: 2026,
        status: 'OPEN',
        dueDate: new Date('2026-03-20T00:00:00.000Z'),
        total: '120.00',
      },
    ])
    expect(report.transfers).toEqual([
      {
        transferId: 4,
        description: 'Reserve transfer',
        amount: '40.00',
        competenceDate: new Date('2026-03-15T00:00:00.000Z'),
        dueDate: new Date('2026-03-16T00:00:00.000Z'),
        status: 'PENDING',
        sourceAccountName: 'Main',
        destinationAccountName: 'Reserve',
      },
    ])
  })

  it('lists available months from transactions, transfers and invoices', async () => {
    const { getAvailableMonths } = await import('@/services/dashboardService')

    prismaMock.transaction.findMany.mockResolvedValueOnce([
      { competenceDate: new Date('2026-01-10T00:00:00.000Z') },
    ])
    prismaMock.transfer.findMany.mockResolvedValueOnce([
      { competenceDate: new Date('2026-02-14T00:00:00.000Z') },
    ])
    prismaMock.invoice.findMany.mockResolvedValueOnce([
      { dueDate: new Date('2026-03-20T00:00:00.000Z') },
    ])

    await expect(getAvailableMonths('user-1')).resolves.toEqual([
      '2026-01',
      '2026-02',
      '2026-03',
    ])

    expect(prismaMock.transaction.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        status: { not: 'CANCELED' },
      },
      select: { competenceDate: true },
    })
    expect(prismaMock.transfer.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        status: { not: 'CANCELED' },
      },
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
})
