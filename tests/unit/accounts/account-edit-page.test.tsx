// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const redirectMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/auth', () => ({
  getUserFromRequest: vi.fn(),
}))

vi.mock('@/modules/accounts/service', () => ({
  getAccountByIdForUser: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  redirect: redirectMock,
}))

vi.mock('@/components/accounts/AccountCreateForm', () => ({
  AccountCreateForm: ({ mode, account }: { mode: string; account: { name: string } }) => (
    <div data-testid="account-edit-form">
      {mode}:{account.name}
    </div>
  ),
}))

describe('account edit page', () => {
  it('guards the route and renders the account form in edit mode', async () => {
    const { getUserFromRequest } = await import('@/lib/auth')
    const { getAccountByIdForUser } = await import('@/modules/accounts/service')
    const { default: AccountEditPage } = await import('@/dashboard/accounts/[accountId]/page')

    vi.mocked(getUserFromRequest).mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
    } as never)
    vi.mocked(getAccountByIdForUser).mockResolvedValue({
      id: 12,
      userId: 'user-1',
      name: 'Nubank',
      type: 'BANK',
      initialBalance: '1250.50',
      institution: 'Nubank',
      color: '#7a2cff',
      icon: 'wallet',
      active: true,
    } as never)

    render(await AccountEditPage({ params: Promise.resolve({ accountId: '12' }) }))

    expect(screen.getByRole('heading', { name: 'Editar conta' })).toBeInTheDocument()
    expect(screen.getByText('Atualize os dados principais da conta sem sair da gestão financeira.')).toBeInTheDocument()
    expect(screen.getByTestId('account-edit-form')).toHaveTextContent('edit:Nubank')
    expect(getAccountByIdForUser).toHaveBeenCalledWith('user-1', 12)
  }, 10000)

  it('redirects to login when the session is absent', async () => {
    const { getUserFromRequest } = await import('@/lib/auth')
    const { default: AccountEditPage } = await import('@/dashboard/accounts/[accountId]/page')

    vi.mocked(getUserFromRequest).mockResolvedValue(null)

    await AccountEditPage({ params: Promise.resolve({ accountId: '12' }) })

    expect(redirectMock).toHaveBeenCalledWith('/login?callbackUrl=%2Fdashboard%2Faccounts%2F12')
  })
})
