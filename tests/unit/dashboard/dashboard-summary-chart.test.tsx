// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DashboardSummaryChart } from '@/components/dashboard/DashboardSummaryChart'

describe('dashboard summary chart', () => {
  it('renders projected and realized datasets for quick comparison', () => {
    render(
      <DashboardSummaryChart
        summary={{
          forecastIncome: '1200.00',
          forecastExpense: '400.00',
          realizedIncome: '1000.00',
          realizedExpense: '350.00',
          forecastBalance: '800.00',
          realizedBalance: '650.00',
        }}
      />,
    )

    expect(screen.getByText('Projetado vs realizado')).toBeInTheDocument()
    expect(screen.getByText('Receitas')).toBeInTheDocument()
    expect(screen.getByText('Despesas')).toBeInTheDocument()
    expect(screen.getByText('Saldo')).toBeInTheDocument()
    expect(screen.getAllByTestId('dashboard-summary-chart-group')).toHaveLength(3)
    expect(screen.getByTestId('dashboard-summary-chart-forecast-income')).toHaveAttribute(
      'aria-label',
      'Receitas projetadas: R$ 1.200,00',
    )
    expect(screen.getByTestId('dashboard-summary-chart-realized-balance')).toHaveAttribute(
      'aria-label',
      'Saldo realizado: R$ 650,00',
    )
  })
})
