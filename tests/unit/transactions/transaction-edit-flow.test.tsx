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

describe('transaction edit flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows an edit action in the transactions list', () => {
    render(
      <TransactionsList
        transactions={[
          {
            id: 14,
            description: 'Internet',
            type: 'EXPENSE',
            value: '129.90',
            status: 'PENDING',
            competenceDate: new Date('2026-03-01T00:00:00.000Z'),
            dueDate: new Date('2026-03-10T00:00:00.000Z'),
            paidAt: null,
            category: { name: 'Moradia' },
          },
        ]}
        accounts={[{ id: 1, name: 'Conta Principal' }]}
      />,
    )

    expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute(
      'href',
      '/dashboard/transactions/14',
    )
  })

  it('renders the edit page with the transaction prefilled', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transactionsMock.getTransactionByUser.mockResolvedValue({
      id: 14,
      type: 'EXPENSE',
      description: 'Internet',
      value: '129.90',
      categoryId: 12,
      accountId: 21,
      creditCardId: null,
      invoiceId: null,
      competenceDate: new Date('2026-03-01T00:00:00.000Z'),
      dueDate: new Date('2026-03-10T00:00:00.000Z'),
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
        params: Promise.resolve({ transactionId: '14' }),
        searchParams: Promise.resolve({}),
      }),
    )

    expect(screen.getByRole('heading', { name: 'Editar transação' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Internet')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Salvar alterações/i })).toBeInTheDocument()
  })
})
