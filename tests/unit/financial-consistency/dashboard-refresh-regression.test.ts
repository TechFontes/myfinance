import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const transactionsMock = vi.hoisted(() => ({
  updateTransactionByUser: vi.fn(),
}))

const dashboardServiceMock = vi.hoisted(() => ({
  getAvailableMonths: vi.fn(),
  getDashboardReport: vi.fn(),
}))

const cacheMock = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/transactions/service', () => transactionsMock)
vi.mock('@/services/dashboardService', () => dashboardServiceMock)
vi.mock('next/cache', () => cacheMock)

import { GET as getDashboard } from '@/api/dashboard/route'
import { PATCH as patchTransaction } from '@/api/transactions/[transactionId]/route'

describe('dashboard freshness regression', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    dashboardServiceMock.getAvailableMonths.mockResolvedValue(['2026-04'])
  })

  it('refreshes the dashboard report after marking a transaction as paid', async () => {
    const staleReport = {
      period: {
        mode: 'MONTHLY',
        month: '2026-04',
        year: 2026,
        monthNumber: 4,
        shortMonthLabel: 'abr',
        label: 'abril de 2026',
      },
      summary: {
        forecastIncome: '0.00',
        forecastExpense: '0.00',
        realizedIncome: '0.00',
        realizedExpense: '0.00',
        forecastBalance: '0.00',
        realizedBalance: '0.00',
      },
      pending: [],
      accounts: [],
      categories: [],
      cardInvoices: [],
      transfers: [],
    }
    const freshReport = {
      ...staleReport,
      summary: {
        ...staleReport.summary,
        realizedExpense: '125.00',
        realizedBalance: '-125.00',
      },
    }

    let currentReport = staleReport

    transactionsMock.updateTransactionByUser.mockResolvedValue({
      id: 10,
      status: 'PAID',
      paidAt: new Date('2026-04-08T00:00:00.000Z'),
    })

    dashboardServiceMock.getDashboardReport.mockImplementation(async () => currentReport)
    cacheMock.revalidatePath.mockImplementation((path: string) => {
      if (path === '/dashboard' || path === '/dashboard/transactions') {
        currentReport = freshReport
      }
    })

    const mutationResponse = await patchTransaction(
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

    const dashboardResponse = await getDashboard(
      new NextRequest('http://localhost/api/dashboard?month=2026-04'),
    )
    const dashboardPayload = await dashboardResponse.json()

    expect(mutationResponse.status).toBe(200)
    expect(transactionsMock.updateTransactionByUser).toHaveBeenCalledWith(
      'user-1',
      10,
      expect.objectContaining({
        status: 'PAID',
        paidAt: new Date('2026-04-08T00:00:00.000Z'),
      }),
    )
    expect(cacheMock.revalidatePath).toHaveBeenCalledWith('/dashboard')
    expect(cacheMock.revalidatePath).toHaveBeenCalledWith('/dashboard/transactions')
    expect(dashboardPayload.summary.realizedExpense).toBe('125.00')
  })
})
