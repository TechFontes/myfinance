// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const dashboardMock = vi.hoisted(() => ({
  getDashboardReport: vi.fn(),
  getAvailableMonths: vi.fn(),
}))

const reportViewMock = vi.hoisted(() => vi.fn())
const redirectMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/services/dashboardService', () => dashboardMock)
vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}))
vi.mock('@/components/dashboard/DashboardReportView', () => ({
  DashboardReportView: ({
    report,
    availableMonths,
    selectedView,
  }: {
    report: { period: { month: string; label: string } }
    availableMonths: string[]
    selectedView?: string
  }) => {
    reportViewMock({ report, availableMonths, selectedView })

    return (
      <div data-testid="dashboard-report-view">
        {report.period.label} | {availableMonths.join(',')} | {selectedView}
      </div>
    )
  },
}))

describe('dashboard page', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  beforeEach(() => {
    vi.useRealTimers()
    redirectMock.mockReset()
    reportViewMock.mockReset()
    dashboardMock.getDashboardReport.mockReset()
    dashboardMock.getAvailableMonths.mockReset()
    authMock.getUserFromRequest.mockReset()
  })

  it('renders the dashboard wrapper with monthly selection', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    dashboardMock.getAvailableMonths.mockResolvedValue(['2026-02', '2026-03'])
    dashboardMock.getDashboardReport.mockResolvedValue({
      period: { mode: 'MONTHLY', month: '2026-03', label: 'março de 2026' },
      summary: {
        forecastIncome: '1000.00',
        forecastExpense: '250.00',
        realizedIncome: '850.00',
        realizedExpense: '200.00',
        forecastBalance: '750.00',
        realizedBalance: '650.00',
      },
      pending: [],
      accounts: [],
      categories: [],
      cardInvoices: [],
      transfers: [],
    })

    const { default: DashboardPage } = await import('@/dashboard/page')
    render(await DashboardPage({ searchParams: { month: '2026-03' } }))

    expect(screen.getByTestId('dashboard-report-view')).toHaveTextContent(
      'março de 2026 | 2026-02,2026-03',
    )
    expect(dashboardMock.getDashboardReport).toHaveBeenCalledWith('user-1', '2026-03')
    expect(dashboardMock.getAvailableMonths).toHaveBeenCalledWith('user-1')
    expect(reportViewMock).toHaveBeenCalledWith({
      availableMonths: ['2026-02', '2026-03'],
      report: expect.objectContaining({
        period: expect.objectContaining({
          month: '2026-03',
          label: 'março de 2026',
        }),
      }),
      selectedView: 'general',
    })
  }, 10000)

  it('redirects to login when the session is absent', async () => {
    authMock.getUserFromRequest.mockResolvedValue(null)

    const { default: DashboardPage } = await import('@/dashboard/page')
    await DashboardPage({ searchParams: { month: '2026-03' } })

    expect(redirectMock).toHaveBeenCalledWith('/login?callbackUrl=%2Fdashboard')
    expect(reportViewMock).not.toHaveBeenCalled()
    expect(dashboardMock.getDashboardReport).not.toHaveBeenCalled()
    expect(dashboardMock.getAvailableMonths).not.toHaveBeenCalled()
  })

  it('falls back to the latest available period when no query is provided and the current month has no data', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-18T10:00:00.000Z'))

    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    dashboardMock.getAvailableMonths.mockResolvedValue(['2026-02', '2026-03'])
    dashboardMock.getDashboardReport.mockResolvedValue({
      period: {
        mode: 'MONTHLY',
        month: '2026-03',
        year: 2026,
        monthNumber: 3,
        shortMonthLabel: 'mar',
        label: 'março de 2026',
      },
      summary: {
        forecastIncome: '1000.00',
        forecastExpense: '250.00',
        realizedIncome: '850.00',
        realizedExpense: '200.00',
        forecastBalance: '750.00',
        realizedBalance: '650.00',
      },
      pending: [],
      accounts: [],
      categories: [],
      cardInvoices: [],
      transfers: [],
    })

    const { default: DashboardPage } = await import('@/dashboard/page')
    render(await DashboardPage({}))

    expect(dashboardMock.getAvailableMonths).toHaveBeenCalledWith('user-1')
    expect(dashboardMock.getDashboardReport).toHaveBeenCalledWith('user-1', '2026-03')
    expect(screen.getAllByTestId('dashboard-report-view').at(-1)).toHaveTextContent(
      'março de 2026 | 2026-02,2026-03 | general',
    )
  })

  it('passes the selected dashboard view to the report surface', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    dashboardMock.getAvailableMonths.mockResolvedValue(['2026-03'])
    dashboardMock.getDashboardReport.mockResolvedValue({
      period: {
        mode: 'MONTHLY',
        month: '2026-03',
        year: 2026,
        monthNumber: 3,
        shortMonthLabel: 'mar',
        label: 'março de 2026',
      },
      summary: {
        forecastIncome: '1000.00',
        forecastExpense: '250.00',
        realizedIncome: '850.00',
        realizedExpense: '200.00',
        forecastBalance: '750.00',
        realizedBalance: '650.00',
      },
      pending: [],
      accounts: [],
      categories: [],
      cardInvoices: [],
      transfers: [],
    })

    const { default: DashboardPage } = await import('@/dashboard/page')
    render(await DashboardPage({ searchParams: { month: '2026-03', view: 'payable' } }))

    expect(reportViewMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        selectedView: 'payable',
      }),
    )
  })
})
