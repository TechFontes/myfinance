import { describe, expect, it, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const dashboardServiceMock = vi.hoisted(() => ({
  getDashboardReport: vi.fn(),
  getAvailableMonths: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/services/dashboardService', () => dashboardServiceMock)

describe('dashboard api route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns unauthorized when the user is missing', async () => {
    authMock.getUserFromRequest.mockResolvedValueOnce(null)

    const { GET } = await import('@/api/dashboard/route')
    const request = new NextRequest('http://localhost/api/dashboard?month=2026-03')

    const response = await GET(request)

    expect(response.status).toBe(401)
  })

  it('returns the consolidated dashboard report for the selected month', async () => {
    authMock.getUserFromRequest.mockResolvedValueOnce({
      id: 'user-1',
      email: 'user@example.com',
    })
    dashboardServiceMock.getAvailableMonths.mockResolvedValueOnce(['2026-02', '2026-03'])
    dashboardServiceMock.getDashboardReport.mockResolvedValueOnce({
      period: { mode: 'MONTHLY', month: '2026-03', label: 'março de 2026' },
      summary: {
        forecastIncome: '100.00',
        forecastExpense: '25.00',
        realizedIncome: '50.00',
        realizedExpense: '10.00',
        forecastBalance: '75.00',
        realizedBalance: '40.00',
      },
      pending: [],
      accounts: [],
      categories: [],
      cardInvoices: [],
      transfers: [],
    })

    const { GET } = await import('@/api/dashboard/route')
    const request = new NextRequest('http://localhost/api/dashboard?month=2026-03')

    const response = await GET(request)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(dashboardServiceMock.getAvailableMonths).toHaveBeenCalledWith('user-1')
    expect(dashboardServiceMock.getDashboardReport).toHaveBeenCalledWith('user-1', '2026-03')
    expect(payload).toMatchObject({
      period: { mode: 'MONTHLY', month: '2026-03', label: 'março de 2026' },
      summary: {
        forecastIncome: '100.00',
        realizedBalance: '40.00',
      },
    })
  })

  it('resolves the latest available month when the query is absent and the current month has no data', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-18T10:00:00.000Z'))

    authMock.getUserFromRequest.mockResolvedValueOnce({
      id: 'user-1',
      email: 'user@example.com',
    })
    dashboardServiceMock.getAvailableMonths.mockResolvedValueOnce(['2026-02', '2026-03'])
    dashboardServiceMock.getDashboardReport.mockResolvedValueOnce({
      period: {
        mode: 'MONTHLY',
        month: '2026-03',
        year: 2026,
        monthNumber: 3,
        shortLabel: 'mar',
        label: 'março de 2026',
      },
      summary: {
        forecastIncome: '100.00',
        forecastExpense: '25.00',
        realizedIncome: '50.00',
        realizedExpense: '10.00',
        forecastBalance: '75.00',
        realizedBalance: '40.00',
      },
      pending: [],
      accounts: [],
      categories: [],
      cardInvoices: [],
      transfers: [],
    })

    const { GET } = await import('@/api/dashboard/route')
    const request = new NextRequest('http://localhost/api/dashboard')

    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(dashboardServiceMock.getAvailableMonths).toHaveBeenCalledWith('user-1')
    expect(dashboardServiceMock.getDashboardReport).toHaveBeenCalledWith('user-1', '2026-03')

    vi.useRealTimers()
  })
})
