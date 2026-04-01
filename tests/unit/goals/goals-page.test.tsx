// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const goalsMock = vi.hoisted(() => ({
  listGoalsByUser: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/goals/service', () => goalsMock)

describe('goals page', () => {
  it('renders the goal management view with the new contract', async () => {
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

    const { default: GoalsPage } = await import('@/dashboard/goals/page')
    render(await GoalsPage())

    expect(screen.getByRole('heading', { name: 'Metas' })).toBeInTheDocument()
    expect(
      screen.getByText('Aportes podem ser apenas informacionais ou refletir financeiramente via transferência.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nova meta' })).toBeInTheDocument()
    expect(screen.getByText('Reserva de emergência')).toBeInTheDocument()
    expect(screen.getByText('Conta de reserva #3')).toBeInTheDocument()
    expect(goalsMock.listGoalsByUser).toHaveBeenCalledWith('user-1')
  })
})
