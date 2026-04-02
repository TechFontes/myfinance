// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const cardsMock = vi.hoisted(() => ({
  getCardByUser: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/cards/service', () => cardsMock)
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual<typeof import('next/navigation')>('next/navigation')

  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
    }),
  }
})

describe('card edit page', () => {
  it('renders the card edit form with initial values', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    cardsMock.getCardByUser.mockResolvedValue({
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
      updatedAt: new Date('2026-03-31'),
    })

    const { default: CardEditPage } = await import('@/dashboard/cards/[cardId]/edit/page')
    render(await CardEditPage({ params: Promise.resolve({ cardId: '1' }) }))

    expect(screen.getByRole('heading', { name: 'Editar cartão' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Nubank')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeInTheDocument()
  }, 10000)
})
