// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const goalsMock = vi.hoisted(() => ({
  listGoalsByUser: vi.fn(),
}))

const accountsMock = vi.hoisted(() => ({
  listAccountsByUser: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/goals/service', () => goalsMock)
vi.mock('@/modules/accounts/service', () => accountsMock)

describe('goals page', () => {
  it('renders the goal management view with a navigable create CTA', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    goalsMock.listGoalsByUser.mockResolvedValue([
      {
        id: 1,
        userId: 'user-1',
        name: 'Reserva de emergência',
        targetAmount: '10000.00',
        currentAmount: '2500.00',
        reserveAccountId: 3,
        status: 'ACTIVE',
        description: null,
        createdAt: new Date('2026-03-31'),
        updatedAt: new Date('2026-03-31'),
      },
    ])
    accountsMock.listAccountsByUser.mockResolvedValue([
      {
        id: 3,
        name: 'Conta reserva',
        type: 'BANK',
        initialBalance: '0.00',
        active: true,
        createdAt: new Date('2026-03-31'),
        updatedAt: new Date('2026-03-31'),
      },
    ])

    const { default: GoalsPage } = await import('@/dashboard/goals/page')
    render(await GoalsPage())

    expect(screen.getByRole('heading', { name: 'Metas' })).toBeInTheDocument()
    expect(
      screen.getByText('Aportes, resgates e ajustes podem ser informacionais ou refletir a reserva vinculada.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Nova meta' })).toHaveAttribute(
      'href',
      '/dashboard/goals/new',
    )
    expect(screen.getByText('Reserva de emergência')).toBeInTheDocument()
    expect(screen.getByText('Conta reserva')).toBeInTheDocument()
    expect(goalsMock.listGoalsByUser).toHaveBeenCalledWith('user-1')
    expect(accountsMock.listAccountsByUser).toHaveBeenCalledWith('user-1')
  }, 30000)
})
