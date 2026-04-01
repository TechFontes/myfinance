// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const recurrenceMock = vi.hoisted(() => ({
  listRecurringRulesByUser: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/recurrence/service', () => recurrenceMock)

describe('recurrence page', () => {
  it('renders the recurrence management view with the new contract', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    recurrenceMock.listRecurringRulesByUser.mockResolvedValue([
      {
        id: 1,
        userId: 'user-1',
        type: 'EXPENSE',
        description: 'Academia',
        value: '120.00',
        categoryId: 8,
        accountId: 2,
        creditCardId: null,
        frequency: 'MONTHLY',
        dayOfMonth: 5,
        startDate: new Date('2026-03-01'),
        endDate: null,
        active: true,
        account: { id: 2, name: 'Nubank' },
        creditCard: null,
      },
    ])

    const { default: RecurrencePage } = await import('@/dashboard/recurrence/page')
    render(await RecurrencePage())

    expect(screen.getByRole('heading', { name: 'Recorrência' })).toBeInTheDocument()
    expect(
      screen.getByText('A recorrência gera lançamentos previstos, não pagamentos automáticos.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nova regra' })).toBeInTheDocument()
    expect(screen.getByText('Academia')).toBeInTheDocument()
    expect(screen.getByText('Mensal')).toBeInTheDocument()
    expect(screen.getByText('Ativa')).toBeInTheDocument()
    expect(screen.getByText('Conta: Nubank')).toBeInTheDocument()
  })
})
