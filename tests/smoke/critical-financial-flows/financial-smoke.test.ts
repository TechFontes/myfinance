import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const transactionsMock = vi.hoisted(() => ({
  createTransactionForUser: vi.fn(),
  updateTransactionByUser: vi.fn(),
}))

const transfersMock = vi.hoisted(() => ({
  createTransferForUser: vi.fn(),
}))

const invoicesMock = vi.hoisted(() => ({
  payInvoiceForUser: vi.fn(),
}))

const goalsMock = vi.hoisted(() => ({
  recordGoalContributionForUser: vi.fn(),
}))

const dashboardServiceMock = vi.hoisted(() => ({
  getAvailableMonths: vi.fn(),
  getDashboardReport: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/transactions/service', () => transactionsMock)
vi.mock('@/modules/transfers/service', () => transfersMock)
vi.mock('@/modules/invoices/service', () => invoicesMock)
vi.mock('@/modules/goals/service', () => goalsMock)
vi.mock('@/services/dashboardService', () => dashboardServiceMock)

import { POST as postTransaction } from '@/api/transactions/route'
import { PATCH as patchTransaction } from '@/api/transactions/[transactionId]/route'
import { POST as postTransfer } from '@/api/transfers/route'
import { PATCH as patchInvoice } from '@/api/invoices/[invoiceId]/route'
import { POST as postGoalContribution } from '@/api/goals/[goalId]/contributions/route'
import { GET as getDashboard } from '@/api/dashboard/route'

describe('critical financial flows smoke', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
  })

  it('accepts a card purchase payload through the transactions API', async () => {
    transactionsMock.createTransactionForUser.mockResolvedValue({ id: 10, status: 'PENDING' })

    const response = await postTransaction(
      new Request('http://localhost/api/transactions', {
        method: 'POST',
        body: JSON.stringify({
          type: 'EXPENSE',
          description: 'Notebook parcelado',
          value: '1200.00',
          categoryId: 12,
          creditCardId: 3,
          invoiceId: 8,
          competenceDate: '2026-04-03T00:00:00.000Z',
          dueDate: '2026-04-03T00:00:00.000Z',
          status: 'PENDING',
          installment: 1,
          installments: 10,
        }),
      }) as never,
    )

    expect(response.status).toBe(201)
    expect(transactionsMock.createTransactionForUser).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        creditCardId: 3,
        invoiceId: 8,
        installment: 1,
        installments: 10,
      }),
    )
  })

  it('marks a cash transaction as paid through the transactions API', async () => {
    transactionsMock.updateTransactionByUser.mockResolvedValue({ id: 10, status: 'PAID' })

    const response = await patchTransaction(
      new Request('http://localhost/api/transactions/10', {
        method: 'PATCH',
        body: JSON.stringify({
          id: 10,
          status: 'PAID',
          paidAt: '2026-04-08T00:00:00.000Z',
        }),
      }) as never,
      { params: Promise.resolve({ transactionId: '10' }) },
    )

    expect(response.status).toBe(200)
    expect(transactionsMock.updateTransactionByUser).toHaveBeenCalledWith(
      'user-1',
      10,
      expect.objectContaining({
        status: 'PAID',
        paidAt: new Date('2026-04-08T00:00:00.000Z'),
      }),
    )
  })

  it('creates an internal transfer through the transfers API', async () => {
    transfersMock.createTransferForUser.mockResolvedValue({ id: 20, status: 'PLANNED' })

    const response = await postTransfer(
      new Request('http://localhost/api/transfers', {
        method: 'POST',
        body: JSON.stringify({
          sourceAccountId: 1,
          destinationAccountId: 2,
          amount: '200.00',
          description: 'Reserva do mês',
          competenceDate: '2026-04-12',
          dueDate: '2026-04-12',
        }),
      }) as never,
    )

    expect(response.status).toBe(201)
    expect(transfersMock.createTransferForUser).toHaveBeenCalledWith('user-1', {
      sourceAccountId: 1,
      destinationAccountId: 2,
      amount: '200.00',
      description: 'Reserva do mês',
      competenceDate: '2026-04-12',
      dueDate: '2026-04-12',
    })
  })

  it('marks an invoice as paid through the invoices API', async () => {
    invoicesMock.payInvoiceForUser.mockResolvedValue({ id: 30, status: 'PAID' })

    const response = await patchInvoice(
      new Request('http://localhost/api/invoices/30', {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'PAID',
        }),
      }) as never,
      { params: Promise.resolve({ invoiceId: '30' }) },
    )

    expect(response.status).toBe(200)
    expect(invoicesMock.payInvoiceForUser).toHaveBeenCalledWith('user-1', 30)
  })

  it('records a reserve-backed goal movement through the goals API', async () => {
    goalsMock.recordGoalContributionForUser.mockResolvedValue({
      id: 41,
      goalId: 15,
      transferId: 77,
      amount: '300.00',
      kind: 'CONTRIBUTION',
    })

    const response = await postGoalContribution(
      new Request('http://localhost/api/goals/15/contributions', {
        method: 'POST',
        body: JSON.stringify({
          amount: '300.00',
          kind: 'CONTRIBUTION',
          mode: 'TRANSFER_TO_RESERVE',
          counterpartAccountId: 4,
          movementDate: '2026-04-02',
        }),
      }) as never,
      { params: Promise.resolve({ goalId: '15' }) },
    )

    expect(response.status).toBe(201)
    expect(goalsMock.recordGoalContributionForUser).toHaveBeenCalledWith('user-1', {
      goalId: 15,
      amount: '300.00',
      kind: 'CONTRIBUTION',
      mode: 'TRANSFER_TO_RESERVE',
      counterpartAccountId: 4,
      movementDate: '2026-04-02',
    })
  })

  it('reads the dashboard with the selected month through the dashboard API', async () => {
    dashboardServiceMock.getAvailableMonths.mockResolvedValue(['2026-03', '2026-04'])
    dashboardServiceMock.getDashboardReport.mockResolvedValue({
      period: {
        mode: 'MONTHLY',
        month: '2026-04',
        year: 2026,
        monthNumber: 4,
        shortLabel: 'abr',
        label: 'abril de 2026',
      },
      summary: {
        forecastIncome: '300.00',
        forecastExpense: '0.00',
        realizedIncome: '500.00',
        realizedExpense: '100.00',
        forecastBalance: '300.00',
        realizedBalance: '400.00',
      },
      pending: [],
      accounts: [],
      categories: [],
      cardInvoices: [],
      transfers: [],
    })

    const response = await getDashboard(
      new NextRequest('http://localhost/api/dashboard?month=2026-04'),
    )

    expect(response.status).toBe(200)
    expect(dashboardServiceMock.getAvailableMonths).toHaveBeenCalledWith('user-1')
    expect(dashboardServiceMock.getDashboardReport).toHaveBeenCalledWith('user-1', '2026-04')
  })
})
