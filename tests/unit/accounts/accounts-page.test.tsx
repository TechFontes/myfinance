// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth', () => ({
  getUserFromRequest: vi.fn(),
}))

vi.mock('@/services/accountService', () => ({
  listAccountsByUser: vi.fn(),
}))

vi.mock('@/components/accounts/AccountsList', () => ({
  AccountsList: ({ accounts }: { accounts: Array<{ id: number; name: string }> }) => (
    <div data-testid="accounts-list">{accounts.map((account) => account.name).join(', ')}</div>
  ),
}))

describe('accounts page', () => {
  it('renders the accounts management header and uses the accounts list component', async () => {
    const { getUserFromRequest } = await import('@/lib/auth')
    const { listAccountsByUser } = await import('@/services/accountService')
    const { default: AccountsPage } = await import('@/dashboard/accounts/page')

    vi.mocked(getUserFromRequest).mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
    } as never)

    vi.mocked(listAccountsByUser).mockResolvedValue([
      {
        id: 1,
        name: 'Nubank',
        type: 'BANK',
        initialBalance: '1250.50',
        institution: 'Nubank',
        color: '#7a2cff',
        icon: 'wallet',
        active: true,
      },
    ] as never)

    render(await AccountsPage())

    expect(screen.getByRole('heading', { name: 'Contas' })).toBeInTheDocument()
    expect(screen.getByText('Gerencie contas bancárias, carteiras e saldos iniciais')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nova conta' })).toBeInTheDocument()
    expect(screen.getByTestId('accounts-list')).toHaveTextContent('Nubank')
    expect(listAccountsByUser).toHaveBeenCalledWith('user-1')
  })
})
