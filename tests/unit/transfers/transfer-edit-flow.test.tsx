// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TransfersList } from '@/components/transfers/TransfersList'
import EditTransferPage from '@/dashboard/transfers/[transferId]/page'
import { TransferForm } from '@/components/transfers/TransferForm'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const transfersMock = vi.hoisted(() => ({
  getTransferByUser: vi.fn(),
}))

const accountsMock = vi.hoisted(() => ({
  listAccountsByUser: vi.fn(),
}))

const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
  back: vi.fn(),
}))

const fetchMock = vi.fn()

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/transfers/service', () => transfersMock)
vi.mock('@/modules/accounts/service', () => accountsMock)
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual<typeof import('next/navigation')>('next/navigation')

  return {
    ...actual,
    useRouter: () => ({
      push: routerMock.push,
      back: routerMock.back,
    }),
  }
})

describe('transfer edit flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    cleanup()
  })

  it('shows an edit action in the transfers list', () => {
    render(
      <TransfersList
        transfers={[
          {
            id: 14,
            sourceAccountLabel: 'Conta #10',
            destinationAccountLabel: 'Conta #11',
            amount: '129.90',
            description: 'Reserva mensal',
            competenceDate: new Date('2026-03-01T00:00:00.000Z'),
            dueDate: new Date('2026-03-10T00:00:00.000Z'),
            paidAt: null,
            status: 'PENDING',
          },
        ]}
      />,
    )

    expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute(
      'href',
      '/dashboard/transfers/14',
    )
  })

  it('renders the edit page with the transfer prefilled', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transfersMock.getTransferByUser.mockResolvedValue({
      id: 14,
      sourceAccountId: 10,
      destinationAccountId: 11,
      amount: '129.90',
      description: 'Reserva mensal',
      competenceDate: new Date('2026-03-01T00:00:00.000Z'),
      dueDate: new Date('2026-03-10T00:00:00.000Z'),
      paidAt: null,
      status: 'PENDING',
    })
    accountsMock.listAccountsByUser.mockResolvedValue([
      { id: 10, name: 'Conta principal', active: true },
      { id: 11, name: 'Reserva', active: true },
      { id: 12, name: 'Inativa', active: false },
    ])

    render(
      await EditTransferPage({
        params: Promise.resolve({ transferId: '14' }),
      }),
    )

    expect(screen.getByRole('heading', { name: 'Editar transferência' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Reserva mensal')).toBeInTheDocument()
    expect(screen.getByDisplayValue('129.90')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Salvar alterações/i })).toBeInTheDocument()
  })

  it('submits the edit form with patch and redirects back to the transfers list', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 91 }),
    })

    render(
      <TransferForm
        accounts={[
          { id: 11, name: 'Conta principal' },
          { id: 22, name: 'Reserva' },
        ]}
        initialValues={{
          id: 91,
          sourceAccountId: 11,
          destinationAccountId: 22,
          amount: '150.75',
          description: 'Aporte mensal',
          competenceDate: '2026-04-01',
          dueDate: '2026-04-01',
          paidAt: null,
          status: 'PENDING',
        }}
        mode="edit"
      />,
    )

    await user.clear(screen.getByLabelText('Descrição'))
    await user.type(screen.getByLabelText('Descrição'), 'Aporte ajustado')
    await user.selectOptions(screen.getByLabelText('Status'), 'PAID')
    await user.type(screen.getByLabelText('Pagamento'), '2026-04-03')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/transfers/91',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    })

    const [, request] = fetchMock.mock.calls[0]
    expect(JSON.parse(request.body)).toEqual({
      sourceAccountId: 11,
      destinationAccountId: 22,
      amount: '150.75',
      description: 'Aporte ajustado',
      competenceDate: '2026-04-01',
      dueDate: '2026-04-01',
      status: 'PAID',
      paidAt: '2026-04-03',
    })
    expect(routerMock.push).toHaveBeenCalledWith('/dashboard/transfers')
  })
})
