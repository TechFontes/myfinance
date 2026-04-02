// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const transfersMock = vi.hoisted(() => ({
  listTransfersByUser: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/transfers/service', () => transfersMock)

describe('transfers page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the internal movements view and uses the transfers list component', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transfersMock.listTransfersByUser.mockResolvedValue([
      {
        id: 1,
        sourceAccountId: 10,
        destinationAccountId: 11,
        amount: '150.00',
        description: 'Reserva mensal',
        competenceDate: new Date('2026-03-31'),
        dueDate: new Date('2026-04-01'),
        paidAt: new Date('2026-03-31'),
        status: 'PAID',
      },
    ])

    const { default: TransfersPage } = await import('@/dashboard/transfers/page')
    render(await TransfersPage())

    expect(screen.getByRole('heading', { name: 'Movimentações internas' })).toBeInTheDocument()
    expect(screen.getByText(/Transferências entre contas\./)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Nova transferência' })).toHaveAttribute(
      'href',
      '/dashboard/transfers/new',
    )
    expect(screen.getByTestId('transfers-list')).toHaveTextContent('Conta #10')
    expect(transfersMock.listTransfersByUser).toHaveBeenCalledWith('user-1')
  }, 10000)
})
