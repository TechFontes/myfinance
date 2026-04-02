// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const transfersMock = vi.hoisted(() => ({
  getTransferByUser: vi.fn(),
}))

const accountsMock = vi.hoisted(() => ({
  listAccountsByUser: vi.fn(),
}))

const redirectMock = vi.hoisted(() => vi.fn())
const notFoundMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/transfers/service', () => transfersMock)
vi.mock('@/modules/accounts/service', () => accountsMock)
vi.mock('next/navigation', () => ({
  redirect: redirectMock,
  notFound: notFoundMock,
}))

vi.mock('@/components/transfers/TransferForm', () => ({
  TransferForm: ({ mode, initialValues }: { mode: string; initialValues: { description: string } }) => (
    <div data-testid="transfer-form">
      <span>mode:{mode}</span>
      <span>description:{initialValues.description}</span>
    </div>
  ),
}))

describe('transfer edit page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('awaits async route params and renders the transfer form in edit mode', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transfersMock.getTransferByUser.mockResolvedValue({
      id: 5,
      sourceAccountId: 1,
      destinationAccountId: 2,
      amount: '500.00',
      description: 'Reserva mensal',
      competenceDate: new Date('2026-04-01'),
      dueDate: new Date('2026-04-01'),
      paidAt: new Date('2026-04-01'),
      status: 'PAID',
    })
    accountsMock.listAccountsByUser.mockResolvedValue([
      { id: 1, name: 'Nubank', active: true },
      { id: 2, name: 'Caixa', active: true },
    ])

    const { default: EditTransferPage } = await import('@/dashboard/transfers/[transferId]/page')
    render(await EditTransferPage({ params: Promise.resolve({ transferId: '5' }) }))

    expect(screen.getByTestId('transfer-form')).toBeInTheDocument()
    expect(screen.getByTestId('transfer-form')).toHaveTextContent('mode:edit')
    expect(screen.getByTestId('transfer-form')).toHaveTextContent('description:Reserva mensal')
    expect(transfersMock.getTransferByUser).toHaveBeenCalledWith('user-1', 5)
  }, 10000)

  it('redirects to login when session is missing', async () => {
    authMock.getUserFromRequest.mockResolvedValue(null)

    const { default: EditTransferPage } = await import('@/dashboard/transfers/[transferId]/page')
    await EditTransferPage({ params: Promise.resolve({ transferId: '5' }) })

    expect(redirectMock).toHaveBeenCalledWith('/login?callbackUrl=%2Fdashboard%2Ftransfers')
  }, 10000)

  it('calls notFound for invalid transfer id', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })

    const { default: EditTransferPage } = await import('@/dashboard/transfers/[transferId]/page')
    await EditTransferPage({ params: Promise.resolve({ transferId: 'abc' }) })

    expect(notFoundMock).toHaveBeenCalled()
  }, 10000)
})
