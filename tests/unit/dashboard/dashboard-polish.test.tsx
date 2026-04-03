// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DashboardReportView } from '@/components/dashboard/DashboardReportView'

afterEach(() => {
  cleanup()
})

const emptyReport = {
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

describe('dashboard polish - accent cards, rich empty states, and section hierarchy', () => {
  it('renders summary cards with accent styling classes', () => {
    const { container } = render(
      <DashboardReportView
        availableMonths={['2026-02', '2026-03']}
        report={emptyReport}
      />,
    )

    const accentBars = container.querySelectorAll('[aria-hidden="true"]')
    const hasRoundedAccent = Array.from(accentBars).some((el) =>
      el.className.includes('rounded-t-xl'),
    )
    expect(hasRoundedAccent).toBe(true)

    const hasH2Accent = Array.from(accentBars).some((el) =>
      el.className.includes('h-2'),
    )
    expect(hasH2Accent).toBe(true)

    // Check border-l-4 accent on summary cards
    const cards = container.querySelectorAll('.border-l-4')
    expect(cards.length).toBeGreaterThanOrEqual(2)

    // Check text-5xl for balance values
    const balanceElements = container.querySelectorAll('.text-5xl')
    expect(balanceElements.length).toBeGreaterThanOrEqual(2)
  })

  it('shows patrimonial copy in empty states, not generic text', () => {
    render(
      <DashboardReportView
        availableMonths={['2026-02', '2026-03']}
        report={emptyReport}
      />,
    )

    // General view shows pending, accounts, card invoices, transfers empty states
    expect(
      screen.getByText(/Nenhuma pendência neste período\. Todas as obrigações foram liquidadas\./),
    ).toBeInTheDocument()

    expect(
      screen.getByText(/Nenhuma conta cadastrada\. Cadastre suas contas para acompanhar seu patrimônio\./),
    ).toBeInTheDocument()

    expect(
      screen.getByText(/Nenhuma fatura de cartão neste período\./),
    ).toBeInTheDocument()

    expect(
      screen.getByText(/Nenhuma movimentação interna neste período\./),
    ).toBeInTheDocument()
  })

  it('shows categories empty state in payable view', () => {
    render(
      <DashboardReportView
        availableMonths={['2026-02', '2026-03']}
        report={emptyReport}
        selectedView="payable"
      />,
    )

    expect(
      screen.getByText(/Nenhuma movimentação por categoria neste período\./),
    ).toBeInTheDocument()
  })

  it('renders section eyebrow labels', () => {
    render(
      <DashboardReportView
        availableMonths={['2026-02', '2026-03']}
        report={emptyReport}
      />,
    )

    expect(screen.getByText('Resumo patrimonial')).toBeInTheDocument()
    expect(screen.getByText('Pendências')).toBeInTheDocument()
    expect(screen.getByText('Contas')).toBeInTheDocument()
    // Categorias only shows in general view when there are categories
    expect(screen.getByText('Cartões')).toBeInTheDocument()
    expect(screen.getByText('Movimentações internas')).toBeInTheDocument()
  })
})
