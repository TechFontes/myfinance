// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const transactionsMock = vi.hoisted(() => ({
  getTransactionByUser: vi.fn(),
}))

const formOptionsMock = vi.hoisted(() => ({
  getTransactionFormOptions: vi.fn(),
}))

const redirectMock = vi.hoisted(() => vi.fn())
const notFoundMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/transactions/service', () => transactionsMock)
vi.mock('@/services/transactionFormOptions', () => formOptionsMock)
vi.mock('next/navigation', () => ({
  redirect: redirectMock,
  notFound: notFoundMock,
}))

vi.mock('@/components/transactions/TransactionForm', () => ({
  TransactionForm: ({ mode, action, initialValues }: { mode: string; action: string; initialValues: { description: string } }) => (
    <div data-testid="transaction-form">
      <span>mode:{mode}</span>
      <span>action:{action}</span>
      <span>description:{initialValues.description}</span>
    </div>
  ),
}))

describe('transaction edit page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('awaits async route params and renders the transaction form in edit mode', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transactionsMock.getTransactionByUser.mockResolvedValue({
      id: 10,
      type: 'EXPENSE',
      description: 'Aluguel',
      value: { toString: () => '1500.00' },
      categoryId: 3,
      accountId: 1,
      creditCardId: null,
      invoiceId: null,
      competenceDate: new Date('2026-04-01'),
      dueDate: new Date('2026-04-10'),
      paidAt: null,
      status: 'PENDING',
      fixed: true,
      installment: null,
      installments: null,
    })
    formOptionsMock.getTransactionFormOptions.mockResolvedValue({
      accounts: [{ id: 1, name: 'Nubank' }],
      categories: [{ id: 3, name: 'Moradia', type: 'EXPENSE' }],
      creditCards: [],
    })

    const { default: EditTransactionPage } = await import('@/dashboard/transactions/[transactionId]/page')
    render(await EditTransactionPage({
      params: Promise.resolve({ transactionId: '10' }),
      searchParams: Promise.resolve({}),
    }))

    expect(screen.getByTestId('transaction-form')).toBeInTheDocument()
    expect(screen.getByTestId('transaction-form')).toHaveTextContent('mode:edit')
    expect(screen.getByTestId('transaction-form')).toHaveTextContent('action:default')
    expect(screen.getByTestId('transaction-form')).toHaveTextContent('description:Aluguel')
    expect(transactionsMock.getTransactionByUser).toHaveBeenCalledWith('user-1', 10)
  }, 10000)

  it('passes pay action from resolved searchParams', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transactionsMock.getTransactionByUser.mockResolvedValue({
      id: 10,
      type: 'EXPENSE',
      description: 'Aluguel',
      value: { toString: () => '1500.00' },
      categoryId: 3,
      accountId: 1,
      creditCardId: null,
      invoiceId: null,
      competenceDate: new Date('2026-04-01'),
      dueDate: new Date('2026-04-10'),
      paidAt: null,
      status: 'PENDING',
      fixed: true,
      installment: null,
      installments: null,
    })
    formOptionsMock.getTransactionFormOptions.mockResolvedValue({
      accounts: [],
      categories: [],
      creditCards: [],
    })

    const { default: EditTransactionPage } = await import('@/dashboard/transactions/[transactionId]/page')
    render(await EditTransactionPage({
      params: Promise.resolve({ transactionId: '10' }),
      searchParams: Promise.resolve({ action: 'pay' }),
    }))

    expect(screen.getByTestId('transaction-form')).toHaveTextContent('action:pay')
  }, 10000)

  it('redirects to login when session is missing', async () => {
    authMock.getUserFromRequest.mockResolvedValue(null)

    const { default: EditTransactionPage } = await import('@/dashboard/transactions/[transactionId]/page')
    await EditTransactionPage({
      params: Promise.resolve({ transactionId: '10' }),
      searchParams: Promise.resolve({}),
    })

    expect(redirectMock).toHaveBeenCalledWith('/login?callbackUrl=%2Fdashboard%2Ftransactions')
  }, 10000)

  it('calls notFound for invalid transaction id', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })

    const { default: EditTransactionPage } = await import('@/dashboard/transactions/[transactionId]/page')
    await EditTransactionPage({
      params: Promise.resolve({ transactionId: 'abc' }),
      searchParams: Promise.resolve({}),
    })

    expect(notFoundMock).toHaveBeenCalled()
  }, 10000)
})
