// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: routerMock.push,
  }),
}))

describe('card create page', () => {
  it('renders the create form for cards with the required fields', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })

    const { default: CardCreatePage } = await import('@/dashboard/cards/new/page')
    render(await CardCreatePage())

    expect(screen.getByRole('heading', { name: 'Novo cartão' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
    expect(screen.getByLabelText('Limite')).toBeInTheDocument()
    expect(screen.getByLabelText('Dia de fechamento')).toBeInTheDocument()
    expect(screen.getByLabelText('Dia de vencimento')).toBeInTheDocument()
    expect(screen.getByLabelText('Cor')).toBeInTheDocument()
    expect(screen.getByLabelText('Ícone')).toBeInTheDocument()
    expect(screen.getByLabelText('Ativo')).toBeChecked()
    expect(screen.getByRole('button', { name: 'Salvar cartão' })).toBeInTheDocument()
  }, 30000)
})
