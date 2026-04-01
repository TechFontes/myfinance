// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const cardsMock = vi.hoisted(() => ({
  listCardsByUser: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/cards/service', () => cardsMock)

describe('card detail page', () => {
  it('renders a card summary and upcoming invoices section', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    cardsMock.listCardsByUser.mockResolvedValue([
      {
        id: 1,
        userId: 'user-1',
        name: 'Nubank',
        limit: '5000.00',
        closeDay: 10,
        dueDay: 17,
        color: '#7a2cff',
        icon: 'credit-card',
        active: true,
        createdAt: new Date('2026-03-31'),
      },
    ])

    const { default: CardDetailPage } = await import('@/dashboard/cards/[cardId]/page')
    render(await CardDetailPage({ params: { cardId: '1' } }))

    expect(screen.getByRole('heading', { name: 'Nubank' })).toBeInTheDocument()
    expect(screen.getByText('Fechamento dia 10 e vencimento dia 17')).toBeInTheDocument()
    expect(screen.getByText('Próximas faturas')).toBeInTheDocument()
    expect(screen.getByText('Sem faturas em aberto para este cartão.')).toBeInTheDocument()
  })
})
