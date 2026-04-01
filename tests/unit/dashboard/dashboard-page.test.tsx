// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const dashboardMock = vi.hoisted(() => ({
  getDashboardReport: vi.fn(),
  getAvailableMonths: vi.fn(),
}))

const reportViewMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/services/dashboardService', () => dashboardMock)
vi.mock('@/components/dashboard/DashboardReportView', () => ({
  DashboardReportView: ({
    report,
    availableMonths,
  }: {
    report: { period: { month: string; label: string } }
    availableMonths: string[]
  }) => {
    reportViewMock({ report, availableMonths })

    return (
      <div data-testid="dashboard-report-view">
        {report.period.label} | {availableMonths.join(',')}
      </div>
    )
  },
}))

describe('dashboard page', () => {
  it('renders the dashboard wrapper with monthly selection', async () => {
    reportViewMock.mockReset()
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
    })
  })
})
