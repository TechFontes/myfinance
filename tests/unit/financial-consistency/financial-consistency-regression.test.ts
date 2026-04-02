import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createFinancialCommandService } from '@/modules/financial-core'
import { deriveGoalCurrentAmount, recordGoalContributionForUser } from '@/modules/goals/service'
import { getDashboardReport } from '@/services/dashboardService'
import { payInvoiceForUser } from '@/modules/invoices/service'

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  transaction: {
    findMany: vi.fn(),
  },
  account: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
  transfer: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  invoice: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  goal: {
    findFirst: vi.fn(),
  },
  goalContribution: {
    create: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

describe('financial consistency regression', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof prismaMock) => unknown) =>
      callback(prismaMock as never),
    )
  })

  it('keeps paid transactions and paid transfers reflected in dashboard balances and summaries', async () => {
    prismaMock.transaction.findMany.mockResolvedValueOnce([
      {
        id: 1,
        type: 'INCOME',
        description: 'Salário',
        value: '500.00',
        status: 'PAID',
        competenceDate: new Date('2026-04-05T00:00:00.000Z'),
        dueDate: new Date('2026-04-05T00:00:00.000Z'),
        paidAt: new Date('2026-04-05T00:00:00.000Z'),
        category: { id: 10, name: 'Salário', type: 'INCOME' },
        account: { id: 1, name: 'Conta principal', type: 'BANK' },
      },
      {
        id: 2,
        type: 'EXPENSE',
        description: 'Aluguel',
        value: '100.00',
        status: 'PAID',
        competenceDate: new Date('2026-04-10T00:00:00.000Z'),
        dueDate: new Date('2026-04-10T00:00:00.000Z'),
        paidAt: new Date('2026-04-10T00:00:00.000Z'),
        category: { id: 11, name: 'Moradia', type: 'EXPENSE' },
        account: { id: 1, name: 'Conta principal', type: 'BANK' },
      },
      {
        id: 3,
        type: 'INCOME',
        description: 'Freelance',
        value: '300.00',
        status: 'PLANNED',
        competenceDate: new Date('2026-04-20T00:00:00.000Z'),
        dueDate: new Date('2026-04-20T00:00:00.000Z'),
        paidAt: null,
        category: { id: 12, name: 'Freelance', type: 'INCOME' },
        account: { id: 1, name: 'Conta principal', type: 'BANK' },
      },
    ])
    prismaMock.account.findMany.mockResolvedValueOnce([
      { id: 1, name: 'Conta principal', type: 'BANK', initialBalance: '1000.00', active: true },
      { id: 2, name: 'Reserva', type: 'WALLET', initialBalance: '200.00', active: true },
    ])
    prismaMock.transfer.findMany.mockResolvedValueOnce([
      {
        id: 20,
        description: 'Transferência para reserva',
        amount: '200.00',
        competenceDate: new Date('2026-04-12T00:00:00.000Z'),
        dueDate: new Date('2026-04-12T00:00:00.000Z'),
        paidAt: new Date('2026-04-12T00:00:00.000Z'),
        status: 'PAID',
        sourceAccount: { id: 1, name: 'Conta principal' },
        destinationAccount: { id: 2, name: 'Reserva' },
      },
    ])
    prismaMock.invoice.findMany.mockResolvedValueOnce([
      {
        id: 30,
        month: 4,
        year: 2026,
        status: 'OPEN',
        dueDate: new Date('2026-04-25T00:00:00.000Z'),
        total: '0.00',
        creditCard: { id: 8, name: 'Cartão principal' },
        transactions: [{ id: 50, value: '150.00', status: 'OPEN' }],
      },
    ])

    const report = await getDashboardReport('user-1', '2026-04')

    expect(report.summary).toEqual({
      forecastIncome: '300.00',
      forecastExpense: '0.00',
      realizedIncome: '500.00',
      realizedExpense: '100.00',
      forecastBalance: '300.00',
      realizedBalance: '400.00',
    })
    expect(report.accounts).toEqual([
      expect.objectContaining({ id: 1, balance: '1200.00' }),
      expect.objectContaining({ id: 2, balance: '400.00' }),
    ])
    expect(report.transfers).toEqual([
      expect.objectContaining({
        transferId: 20,
        status: 'PAID',
        sourceAccountName: 'Conta principal',
        destinationAccountName: 'Reserva',
      }),
    ])
  })

  it('keeps card purchase totals reconciled when the invoice is marked as paid', async () => {
    prismaMock.invoice.findFirst.mockResolvedValueOnce({
      id: 10,
      creditCardId: 7,
      month: 4,
      year: 2026,
      dueDate: new Date('2026-04-20T00:00:00.000Z'),
      status: 'OPEN',
      total: { toString: () => '1.00' },
      transactions: [
        { id: 1, value: '120.00', status: 'PENDING' },
        { id: 2, value: '80.00', status: 'PENDING' },
        { id: 3, value: '50.00', status: 'CANCELED' },
      ],
      creditCard: { id: 7, userId: 'user-1' },
    } as never)
    prismaMock.invoice.update.mockResolvedValueOnce({
      id: 10,
      creditCardId: 7,
      month: 4,
      year: 2026,
      dueDate: new Date('2026-04-20T00:00:00.000Z'),
      status: 'PAID',
      total: { toString: () => '1.00' },
      transactions: [
        { id: 1, value: '120.00', status: 'PENDING' },
        { id: 2, value: '80.00', status: 'PENDING' },
        { id: 3, value: '50.00', status: 'CANCELED' },
      ],
      creditCard: { id: 7, userId: 'user-1' },
    } as never)

    const invoice = await payInvoiceForUser('user-1', 10)

    expect(invoice).toMatchObject({
      id: 10,
      status: 'PAID',
      total: '200.00',
    })
  })

  it('keeps reserve-backed goal movements linked to a paid transfer and signed progress', async () => {
    prismaMock.goal.findFirst.mockResolvedValueOnce({
      id: 15,
      userId: 'user-1',
      name: 'Reserva de emergência',
      reserveAccountId: 9,
    })
    prismaMock.account.findFirst
      .mockResolvedValueOnce({ id: 4, userId: 'user-1' })
      .mockResolvedValueOnce({ id: 9, userId: 'user-1' })
    prismaMock.transfer.create.mockResolvedValueOnce({
      id: 77,
      userId: 'user-1',
      sourceAccountId: 4,
      destinationAccountId: 9,
      amount: '300.00',
      description: 'Aporte para meta: Reserva de emergência',
      competenceDate: new Date('2026-04-02T00:00:00.000Z'),
      dueDate: new Date('2026-04-02T00:00:00.000Z'),
      paidAt: new Date('2026-04-02T00:00:00.000Z'),
      status: 'PAID',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)
    prismaMock.goalContribution.create.mockResolvedValueOnce({
      id: 41,
      goalId: 15,
      transferId: 77,
      amount: '300.00',
      kind: 'CONTRIBUTION',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)

    const contribution = await recordGoalContributionForUser('user-1', {
      goalId: 15,
      amount: '300.00',
      kind: 'CONTRIBUTION',
      mode: 'TRANSFER_TO_RESERVE',
      counterpartAccountId: 4,
      movementDate: '2026-04-02',
    })

    expect(contribution).toMatchObject({
      goalId: 15,
      transferId: 77,
      kind: 'CONTRIBUTION',
    })
    expect(
      deriveGoalCurrentAmount([
        { amount: '300.00', kind: 'CONTRIBUTION' },
        { amount: '50.00', kind: 'WITHDRAWAL' },
      ]),
    ).toBe('250.00')

    const commandService = createFinancialCommandService({
      settleTransaction: vi.fn(),
      createCardPurchase: vi.fn(),
      payInvoice: vi.fn(),
      createTransfer: vi.fn(),
      recordGoalContribution: vi.fn().mockResolvedValue({
        contributionId: 41,
        goalId: 15,
        transferId: 77,
      }),
    })

    const result = await commandService.recordGoalContributionCommand({
      goalId: 15,
      mode: 'TRANSFER_TO_RESERVE',
      amount: '300.00',
      reserveAccountId: 9,
    })

    expect(result).toMatchObject({
      command: 'recordGoalContribution',
      writes: ['goal', 'transfer', 'account-balance', 'dashboard-read-model'],
      rule: {
        mode: 'TRANSFER_TO_RESERVE',
        transferId: 77,
      },
    })
  })

  it('keeps card purchase commands mapped to invoice writes for downstream dashboard reflection', async () => {
    const commandService = createFinancialCommandService({
      settleTransaction: vi.fn(),
      createCardPurchase: vi.fn().mockResolvedValue({
        transactionId: 11,
        creditCardId: 2,
        invoiceId: 8,
      }),
      payInvoice: vi.fn(),
      createTransfer: vi.fn(),
      recordGoalContribution: vi.fn(),
    })

    const result = await commandService.createCardPurchaseCommand({
      creditCardId: 2,
      amount: '120.00',
      competenceDate: new Date('2026-04-03T00:00:00.000Z'),
    })

    expect(result).toMatchObject({
      command: 'createCardPurchase',
      writes: ['transaction', 'invoice', 'dashboard-read-model'],
      rule: {
        creditCardId: 2,
        invoiceId: 8,
      },
    })
  })
})
