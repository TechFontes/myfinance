// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TransactionsList } from '@/components/transactions/TransactionsList'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const transactionsMock = vi.hoisted(() => ({
  getTransactionByUser: vi.fn(),
}))

const formOptionsMock = vi.hoisted(() => ({
  getTransactionFormOptions: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/transactions/service', () => transactionsMock)
vi.mock('@/services/transactionFormOptions', () => formOptionsMock)
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual<typeof import('next/navigation')>('next/navigation')

  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
      back: vi.fn(),
    }),
  }
})

import EditTransactionPage from '@/dashboard/transactions/[transactionId]/page'

describe('transaction payment flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the payment action only for unpaid account transactions', () => {
    render(
      <TransactionsList
        transactions={[
          {
            id: 10,
            description: 'Aluguel',
            type: 'EXPENSE',
            value: '1500.00',
            status: 'PENDING',
            competenceDate: new Date('2026-03-01T00:00:00.000Z'),
            dueDate: new Date('2026-03-05T00:00:00.000Z'),
            paidAt: null,
            category: { name: 'Moradia' },
            creditCardId: null,
          },
          {
            id: 11,
            description: 'Mercado parcelado',
            type: 'EXPENSE',
            value: '450.00',
            status: 'PENDING',
            competenceDate: new Date('2026-03-01T00:00:00.000Z'),
            dueDate: new Date('2026-03-08T00:00:00.000Z'),
            paidAt: null,
            category: { name: 'Mercado' },
            creditCardId: 31,
          },
        ]}
      />,
    )

    const paymentLinks = screen.getAllByRole('link', { name: 'Informar pagamento' })

    expect(paymentLinks).toHaveLength(1)
    expect(paymentLinks[0]).toHaveAttribute(
      'href',
      '/dashboard/transactions/10?action=pay',
    )
  })

  it('opens the transaction page in payment mode with payment date visible', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transactionsMock.getTransactionByUser.mockResolvedValue({
      id: 10,
      type: 'EXPENSE',
      description: 'Aluguel',
      value: '1500.00',
      categoryId: 12,
      accountId: 21,
      creditCardId: null,
      invoiceId: null,
      competenceDate: new Date('2026-03-01T00:00:00.000Z'),
      dueDate: new Date('2026-03-05T00:00:00.000Z'),
      paidAt: null,
      status: 'PENDING',
      fixed: false,
      installment: null,
      installments: null,
    })
    formOptionsMock.getTransactionFormOptions.mockResolvedValue({
      categories: [{ id: 12, name: 'Moradia', type: 'EXPENSE' }],
      accounts: [{ id: 21, name: 'Conta Principal' }],
      cards: [],
    })

    render(
      await EditTransactionPage({
        params: Promise.resolve({ transactionId: '10' }),
        searchParams: Promise.resolve({ action: 'pay' }),
      }),
    )

    expect(screen.getByRole('heading', { name: 'Informar pagamento' })).toBeInTheDocument()
    expect(screen.getByText('Pagamento', { selector: 'label' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Confirmar pagamento/i })).toBeInTheDocument()
  })
})
