// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const accountsMock = vi.hoisted(() => ({
  listAccountsByUser: vi.fn(),
}))

const routerMock = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/accounts/service', () => accountsMock)
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: routerMock.replace,
    refresh: routerMock.refresh,
  }),
}))

describe('goal create page', () => {
  it('renders the create form with human-friendly reserve account options', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    accountsMock.listAccountsByUser.mockResolvedValue([
      {
        id: 7,
        userId: 'user-1',
        name: 'Conta principal',
        type: 'BANK',
        initialBalance: '0.00',
        institution: null,
        color: null,
        icon: null,
        active: true,
      },
    ])

    const { default: GoalCreatePage } = await import('@/dashboard/goals/new/page')
    render(await GoalCreatePage())

    expect(screen.getByRole('heading', { name: 'Nova meta' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
    expect(screen.getByLabelText('Meta')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Conta de reserva' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Status' })).toBeInTheDocument()
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument()
    expect(accountsMock.listAccountsByUser).toHaveBeenCalledWith('user-1')
  }, 30000)
})
