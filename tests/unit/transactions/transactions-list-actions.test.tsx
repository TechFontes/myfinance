// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TransactionsList, TransactionsListItem } from '@/components/transactions/TransactionsList'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}))

vi.mock('@/components/transactions/SettleTransactionDialog', () => ({
  SettleTransactionDialog: ({ trigger }: { trigger: React.ReactNode }) => (
    <div data-testid="settle-dialog">{trigger}</div>
  ),
}))

vi.mock('@/components/shared/CancelConfirmDialog', () => ({
  CancelConfirmDialog: ({ trigger }: { trigger: React.ReactNode }) => (
    <div data-testid="cancel-dialog">{trigger}</div>
  ),
}))

function buildTransaction(overrides: Partial<TransactionsListItem> & { id: number }): TransactionsListItem {
  return {
    description: `Transaction ${overrides.id}`,
    type: 'EXPENSE',
    value: '100.00',
    status: 'PLANNED',
    competenceDate: '2026-03-01',
    dueDate: '2026-03-10',
    paidAt: null,
    creditCardId: null,
    category: null,
    ...overrides,
  }
}

const accounts = [{ id: 1, name: 'Conta Corrente' }]

describe('TransactionsList quick actions', () => {
  afterEach(() => {
    cleanup()
  })

  it('shows Liquidar button for PLANNED transaction without creditCard', () => {
    render(
      <TransactionsList
        accounts={accounts}
        transactions={[buildTransaction({ id: 1, status: 'PLANNED' })]}
      />,
    )

    expect(screen.getByTestId('settle-dialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Liquidar' })).toBeInTheDocument()
  })

  it('does not show Liquidar button for PAID transaction', () => {
    render(
      <TransactionsList
        accounts={accounts}
        transactions={[buildTransaction({ id: 2, status: 'PAID' })]}
      />,
    )

    expect(screen.queryByTestId('settle-dialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Liquidar' })).not.toBeInTheDocument()
  })

  it('does not show Liquidar button for CANCELED transaction', () => {
    render(
      <TransactionsList
        accounts={accounts}
        transactions={[buildTransaction({ id: 3, status: 'CANCELED' })]}
      />,
    )

    expect(screen.queryByTestId('settle-dialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Liquidar' })).not.toBeInTheDocument()
  })

  it('does not show Liquidar button when transaction has creditCardId', () => {
    render(
      <TransactionsList
        accounts={accounts}
        transactions={[buildTransaction({ id: 4, status: 'PLANNED', creditCardId: 10 })]}
      />,
    )

    expect(screen.queryByTestId('settle-dialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Liquidar' })).not.toBeInTheDocument()
  })

  it('shows Cancelar button for PLANNED transaction', () => {
    render(
      <TransactionsList
        accounts={accounts}
        transactions={[buildTransaction({ id: 5, status: 'PLANNED' })]}
      />,
    )

    expect(screen.getByTestId('cancel-dialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })

  it('shows Cancelar button for PAID transaction', () => {
    render(
      <TransactionsList
        accounts={accounts}
        transactions={[buildTransaction({ id: 6, status: 'PAID' })]}
      />,
    )

    expect(screen.getByTestId('cancel-dialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })

  it('does not show Cancelar button for CANCELED transaction', () => {
    render(
      <TransactionsList
        accounts={accounts}
        transactions={[buildTransaction({ id: 7, status: 'CANCELED' })]}
      />,
    )

    expect(screen.queryByTestId('cancel-dialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument()
  })

  it('shows both Liquidar and Cancelar for PENDING transaction without creditCard', () => {
    render(
      <TransactionsList
        accounts={accounts}
        transactions={[buildTransaction({ id: 8, status: 'PENDING' })]}
      />,
    )

    expect(screen.getByTestId('settle-dialog')).toBeInTheDocument()
    expect(screen.getByTestId('cancel-dialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Liquidar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })
})
