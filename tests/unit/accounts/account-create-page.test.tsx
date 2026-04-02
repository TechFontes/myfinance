// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const redirectMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/auth', () => ({
  getUserFromRequest: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}))

vi.mock('@/components/accounts/AccountCreateForm', () => ({
  AccountCreateForm: () => <div data-testid="account-create-form" />,
}))

describe('account create page', () => {
  it('guards the route and renders the account create form for logged users', async () => {
    const { getUserFromRequest } = await import('@/lib/auth')
    const { default: AccountCreatePage } = await import('@/dashboard/accounts/new/page')

    vi.mocked(getUserFromRequest).mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
    } as never)

    render(await AccountCreatePage())

    expect(screen.getByRole('heading', { name: 'Nova conta' })).toBeInTheDocument()
    expect(screen.getByText('Cadastre contas bancárias, carteiras e saldos iniciais.')).toBeInTheDocument()
    expect(screen.getByTestId('account-create-form')).toBeInTheDocument()
  }, 10000)

  it('redirects to login when the session is absent', async () => {
    const { getUserFromRequest } = await import('@/lib/auth')
    const { default: AccountCreatePage } = await import('@/dashboard/accounts/new/page')

    vi.mocked(getUserFromRequest).mockResolvedValue(null)

    await AccountCreatePage()

    expect(redirectMock).toHaveBeenCalledWith('/login?callbackUrl=%2Fdashboard%2Faccounts%2Fnew')
  })
})
