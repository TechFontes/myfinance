// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { AccumulatedView } from '@/components/dashboard/AccumulatedView'

afterEach(() => {
  cleanup()
})

describe('AccumulatedView', () => {
  it('renders the patrimony total', () => {
    render(
      <AccumulatedView
        totalBalance="15000.00"
        accounts={[]}
        patrimonyData={[]}
      />,
    )

    expect(screen.getByTestId('patrimony-total')).toBeInTheDocument()
    expect(screen.getByText('Patrimônio total')).toBeInTheDocument()
    expect(screen.getByText('Soma dos saldos de todas as contas')).toBeInTheDocument()
  })

  it('renders the line chart section', () => {
    render(
      <AccumulatedView
        totalBalance="15000.00"
        accounts={[]}
        patrimonyData={[
          { month: '2026-01', label: 'jan', realized: 5000, forecast: 6000 },
          { month: '2026-02', label: 'fev', realized: 7000, forecast: 8000 },
        ]}
      />,
    )

    expect(screen.getByText('Patrimônio acumulado')).toBeInTheDocument()
    expect(screen.getByText('Evolução mensal do patrimônio realizado e previsto.')).toBeInTheDocument()
    expect(screen.getByTestId('patrimony-line-chart')).toBeInTheDocument()
  })

  it('renders the account breakdown table', () => {
    render(
      <AccumulatedView
        totalBalance="8200.00"
        accounts={[
          { name: 'Nubank', balance: '5200.00' },
          { name: 'Carteira', balance: '3000.00' },
        ]}
        patrimonyData={[]}
      />,
    )

    expect(screen.getByText('Saldos por conta')).toBeInTheDocument()
    expect(screen.getByText('Nubank')).toBeInTheDocument()
    expect(screen.getByText('Carteira')).toBeInTheDocument()
    expect(screen.getByTestId('account-breakdown')).toBeInTheDocument()
  })

  it('renders empty state when no accounts exist', () => {
    render(
      <AccumulatedView
        totalBalance="0.00"
        accounts={[]}
        patrimonyData={[]}
      />,
    )

    expect(screen.getByText('Nenhuma conta cadastrada.')).toBeInTheDocument()
  })
})
