// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const cardsMock = vi.hoisted(() => ({
  listCardsByUser: vi.fn(),
}))

const redirectMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/cards/service', () => cardsMock)
vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}))

describe('card detail page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

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
  }, 10000)

  it('awaits async route params and renders the card detail under runtime semantics', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    cardsMock.listCardsByUser.mockResolvedValue([
      {
        id: 3,
        userId: 'user-1',
        name: 'Itaú Platinum',
        limit: '8000.00',
        closeDay: 15,
        dueDay: 25,
        color: null,
        icon: null,
        active: true,
        createdAt: new Date('2026-03-31'),
      },
    ])

    const { default: CardDetailPage } = await import('@/dashboard/cards/[cardId]/page')
    render(await CardDetailPage({ params: Promise.resolve({ cardId: '3' }) }))

    expect(screen.getByRole('heading', { name: 'Itaú Platinum' })).toBeInTheDocument()
    expect(screen.getByText('Fechamento dia 15 e vencimento dia 25')).toBeInTheDocument()
  }, 10000)

  it('builds the login callback from resolved async params when session is missing', async () => {
    authMock.getUserFromRequest.mockResolvedValue(null)

    const { default: CardDetailPage } = await import('@/dashboard/cards/[cardId]/page')
    await CardDetailPage({ params: Promise.resolve({ cardId: '3' }) })

    expect(redirectMock).toHaveBeenCalledWith('/login?callbackUrl=%2Fdashboard%2Fcards%2F3')
  }, 10000)
})
