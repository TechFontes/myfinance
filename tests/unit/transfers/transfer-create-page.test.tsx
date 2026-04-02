// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const accountsMock = vi.hoisted(() => ({
  listAccountsByUser: vi.fn(),
}))

const formMock = vi.hoisted(() => ({
  TransferCreateForm: vi.fn(({ accounts }: { accounts: Array<{ id: number; name: string }> }) => (
    <div data-testid="transfer-create-form">{accounts.map((account) => account.name).join(', ')}</div>
  )),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/accounts/service', () => accountsMock)
vi.mock('@/components/transfers/TransferCreateForm', () => formMock)

describe('transfer create page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads user accounts and renders the create form with human-friendly options', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    accountsMock.listAccountsByUser.mockResolvedValue([
      {
        id: 4,
        userId: 'user-1',
        name: 'Conta principal',
        type: 'BANK',
        initialBalance: '0.00',
        institution: null,
        color: null,
        icon: null,
        active: true,
      },
      {
        id: 5,
        userId: 'user-1',
        name: 'Reserva',
        type: 'BANK',
        initialBalance: '0.00',
        institution: null,
        color: null,
        icon: null,
        active: false,
      },
    ])

    const { default: TransferCreatePage } = await import('@/dashboard/transfers/new/page')
    render(await TransferCreatePage())

    expect(screen.getByTestId('transfer-create-form')).toHaveTextContent('Conta principal')
    expect(screen.queryByTestId('transfer-create-form')).not.toHaveTextContent('Reserva')
    expect(accountsMock.listAccountsByUser).toHaveBeenCalledWith('user-1')
    expect(formMock.TransferCreateForm).toHaveBeenCalledWith(
      expect.objectContaining({
        accounts: [{ id: 4, name: 'Conta principal' }],
      }),
      undefined,
    )
  })
})
