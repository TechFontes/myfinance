// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const goalsMock = vi.hoisted(() => ({
  getGoalByUser: vi.fn(),
}))

const accountsMock = vi.hoisted(() => ({
  listAccountsByUser: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/goals/service', () => goalsMock)
vi.mock('@/modules/accounts/service', () => accountsMock)
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual<typeof import('next/navigation')>('next/navigation')

  return {
    ...actual,
    useRouter: () => ({
      replace: vi.fn(),
      refresh: vi.fn(),
    }),
  }
})

describe('goal edit page', () => {
  it('renders the goal edit form with initial values', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    goalsMock.getGoalByUser.mockResolvedValue({
      id: 1,
      userId: 'user-1',
      name: 'Reserva de emergência',
      targetAmount: '10000.00',
      currentAmount: '2500.00',
      reserveAccountId: 3,
      status: 'ACTIVE',
      description: 'Meta principal',
      createdAt: new Date('2026-03-31'),
      updatedAt: new Date('2026-03-31'),
    })
    accountsMock.listAccountsByUser.mockResolvedValue([
      {
        id: 3,
        name: 'Conta principal',
        type: 'BANK',
        initialBalance: '1000.00',
        active: true,
        createdAt: new Date('2026-03-31'),
        updatedAt: new Date('2026-03-31'),
      },
    ])

    const { default: GoalEditPage } = await import('@/dashboard/goals/[goalId]/edit/page')
    render(await GoalEditPage({ params: Promise.resolve({ goalId: '1' }) }))

    expect(screen.getByRole('heading', { name: 'Editar meta' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Reserva de emergência')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeInTheDocument()
  }, 20000)
})
