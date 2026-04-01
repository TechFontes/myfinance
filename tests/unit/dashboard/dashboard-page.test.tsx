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

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/services/dashboardService', () => dashboardMock)

describe('dashboard page', () => {
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

    expect(screen.getByRole('heading', { name: 'Visão geral' })).toBeInTheDocument()
    expect(
      screen.getByText('Sua situação financeira consolidada do período selecionado.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Período' })).toHaveValue('2026-03')
    expect(screen.getByRole('button', { name: 'Ver período' })).toBeInTheDocument()
    expect(dashboardMock.getDashboardReport).toHaveBeenCalledWith('user-1', '2026-03')
    expect(dashboardMock.getAvailableMonths).toHaveBeenCalledWith('user-1')
  })
})
