// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const transactionsMock = vi.hoisted(() => ({
  listTransactionsByUser: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/transactions/service', () => transactionsMock)
vi.mock('@/components/newTransactionButton', () => ({
  NewTransactionButton: () => <button>Nova transação</button>,
}))

import TransactionsPage from '@/dashboard/transactions/page'

describe('transactions page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the new transaction contract fields in the list', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transactionsMock.listTransactionsByUser.mockResolvedValue([
      {
        id: 1,
        description: 'Internet',
        type: 'EXPENSE',
        value: '129.90',
        status: 'PENDING',
        competenceDate: new Date('2026-03-01T00:00:00.000Z'),
        dueDate: new Date('2026-03-10T00:00:00.000Z'),
        paidAt: null,
        category: { name: 'Moradia' },
      },
    ])

    render(await TransactionsPage())

    expect(screen.getByRole('heading', { name: 'Transações' })).toBeInTheDocument()
    expect(screen.getByText('Competência')).toBeInTheDocument()
    expect(screen.getByText('Vencimento')).toBeInTheDocument()
    expect(screen.getByText('Pagamento')).toBeInTheDocument()
    expect(screen.getByText('Pendente')).toBeInTheDocument()
    expect(screen.getByText('Internet')).toBeInTheDocument()
    expect(screen.getByText('Moradia')).toBeInTheDocument()
  }, 10000)
})
