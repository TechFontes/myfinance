// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DashboardReportView } from '@/components/dashboard/DashboardReportView'

afterEach(() => {
  cleanup()
})

const baseReport = {
  period: {
    mode: 'MONTHLY' as const,
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
}

describe('Acumulado tab in DashboardReportView', () => {
  it('renders the Acumulado tab link', () => {
    render(
      <DashboardReportView
        availableMonths={['2026-03']}
        report={baseReport}
      />,
    )

    const link = screen.getByRole('link', { name: 'Acumulado' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/dashboard?view=accumulated&month=2026-03')
  })

  it('marks Acumulado as active when selected', () => {
    render(
      <DashboardReportView
        availableMonths={['2026-03']}
        report={baseReport}
        selectedView="accumulated"
        accumulatedData={{
          patrimonyData: [],
          accounts: [],
          totalBalance: '0.00',
        }}
      />,
    )

    expect(screen.getByRole('link', { name: 'Acumulado' })).toHaveAttribute('aria-current', 'page')
  })

  it('renders AccumulatedView when accumulated is selected', () => {
    render(
      <DashboardReportView
        availableMonths={['2026-03']}
        report={baseReport}
        selectedView="accumulated"
        accumulatedData={{
          patrimonyData: [
            { month: '2026-01', label: 'jan', realized: 5000, forecast: 6000 },
            { month: '2026-02', label: 'fev', realized: 7000, forecast: 8000 },
          ],
          accounts: [{ name: 'Nubank', balance: '5000.00' }],
          totalBalance: '5000.00',
        }}
      />,
    )

    expect(screen.getByTestId('accumulated-view')).toBeInTheDocument()
    expect(screen.getByText('Patrimônio total')).toBeInTheDocument()
    expect(screen.getByText('Nubank')).toBeInTheDocument()
    // Should not render the normal summary cards
    expect(screen.queryByText('Saldo previsto')).not.toBeInTheDocument()
    expect(screen.queryByText('Projetado vs realizado')).not.toBeInTheDocument()
  })

  it('does not render AccumulatedView for non-accumulated views', () => {
    render(
      <DashboardReportView
        availableMonths={['2026-03']}
        report={baseReport}
        selectedView="general"
      />,
    )

    expect(screen.queryByTestId('accumulated-view')).not.toBeInTheDocument()
    expect(screen.getByText('Saldo previsto')).toBeInTheDocument()
  })
})
