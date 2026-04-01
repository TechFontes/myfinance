// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DashboardReportView } from '@/components/dashboard/DashboardReportView'

afterEach(() => {
  cleanup()
})

describe('dashboard report view', () => {
  it('renders the editorial dashboard header and primary action', () => {
    render(
      <DashboardReportView
        availableMonths={['2026-02', '2026-03']}
        report={{
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
        }}
      />,
    )

    expect(screen.getByText('Dashboard mensal')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Visão geral', level: 1 })).toBeInTheDocument()
    expect(
      screen.getByText('Sua situação financeira consolidada do período selecionado.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Nova transação' }),
    ).toHaveAttribute('href', '/dashboard/transactions/new')
  })

  it('renders patrimonial summary cards with stronger financial semantics', () => {
    render(
      <DashboardReportView
        availableMonths={['2026-03']}
        report={{
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
        }}
      />,
    )

    expect(screen.getByText('Projeção')).toBeInTheDocument()
    expect(screen.getByText('Realizado')).toBeInTheDocument()
    expect(screen.getByText('Saldo previsto')).toBeInTheDocument()
    expect(screen.getByText('Saldo realizado')).toBeInTheDocument()
    expect(screen.getAllByText('Receitas')).toHaveLength(2)
    expect(screen.getAllByText('Despesas')).toHaveLength(2)
    expect(screen.getAllByText('Posição patrimonial do período')).toHaveLength(2)
  })

  it('renders the consolidated monthly sections and data', () => {
    render(
      <DashboardReportView
        availableMonths={['2026-02', '2026-03']}
        report={{
          period: { mode: 'MONTHLY', month: '2026-03', label: 'março de 2026' },
          summary: {
            forecastIncome: '1000.00',
            forecastExpense: '250.00',
            realizedIncome: '850.00',
            realizedExpense: '200.00',
            forecastBalance: '750.00',
            realizedBalance: '650.00',
          },
          pending: [
            {
              id: 1,
              description: 'Aluguel',
              amount: '1200.00',
              dueDate: new Date('2026-03-10T00:00:00.000Z'),
              status: 'PENDING',
            },
          ],
          accounts: [
            {
              id: 2,
              name: 'Nubank',
              type: 'BANK',
              balance: '3200.00',
              active: true,
            },
          ],
          categories: [
            {
              categoryId: 8,
              categoryName: 'Moradia',
              type: 'EXPENSE',
              total: '1200.00',
            },
          ],
          cardInvoices: [
            {
              invoiceId: 7,
              cardId: 2,
              cardName: 'Nubank',
              month: 3,
              year: 2026,
              status: 'OPEN',
              dueDate: new Date('2026-04-15T00:00:00.000Z'),
              total: '1250.40',
            },
          ],
          transfers: [
            {
              transferId: 11,
              description: 'Reserva',
              amount: '300.00',
              competenceDate: new Date('2026-03-08T00:00:00.000Z'),
              dueDate: new Date('2026-03-08T00:00:00.000Z'),
              status: 'PAID',
              sourceAccountName: 'Nubank',
              destinationAccountName: 'Reserva',
            },
          ],
        }}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Visão geral' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Período' })).toHaveValue('2026-03')
    expect(screen.getByText('Saldo previsto')).toBeInTheDocument()
    expect(screen.getByText('Saldo realizado')).toBeInTheDocument()
    expect(screen.getByText('Pendências')).toBeInTheDocument()
    expect(screen.getAllByText('Nubank').length).toBeGreaterThan(0)
    expect(screen.getByText('Moradia')).toBeInTheDocument()
    expect(screen.getByText('Cartões e faturas')).toBeInTheDocument()
    expect(screen.getByText('Movimentações internas')).toBeInTheDocument()
    expect(screen.getAllByText('março de 2026').length).toBeGreaterThan(0)
  })

  it('renders richer empty states and highlighted section chrome', () => {
    render(
      <DashboardReportView
        availableMonths={['2026-03']}
        report={{
          period: { mode: 'MONTHLY', month: '2026-03', label: 'março de 2026' },
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
        }}
      />,
    )

    expect(screen.getByText('Nenhuma conta patrimonial registrada neste período.')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Quando houver lançamentos previstos, este painel destacará vencimentos e valores com leitura patrimonial.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Quando houver contas patrimoniais, este painel destacará saldos, tipo e status de cada posição.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Nenhuma categoria com impacto relevante neste período.')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Quando houver categorias movimentadas, este painel destacará seus impactos e pesos no período.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Nenhuma fatura patrimonial aberta neste período.')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Quando houver faturas em aberto, este painel destacará cartão, vencimento e valor consolidado.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Nenhuma movimentação interna registrada neste período.')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Quando houver transferências internas, este painel destacará origem, destino e data de competência.',
      ),
    ).toBeInTheDocument()
  })
})
