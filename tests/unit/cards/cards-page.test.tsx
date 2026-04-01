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

describe('cards page', () => {
  it('renders the card list with the new contract', async () => {
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

    const { default: CardsPage } = await import('@/dashboard/cards/page')
    render(await CardsPage())

    expect(screen.getByRole('heading', { name: 'Cartões' })).toBeInTheDocument()
    expect(
      screen.getByText('Gerencie limites, fechamento e vencimento dos seus cartões'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Novo cartão' })).toBeInTheDocument()
    expect(screen.getByText('Nubank')).toBeInTheDocument()
    expect(screen.getByText('Fechamento dia 10')).toBeInTheDocument()
    expect(screen.getByText('Vencimento dia 17')).toBeInTheDocument()
    expect(cardsMock.listCardsByUser).toHaveBeenCalledWith('user-1')
  })
})
