// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TransactionsList } from '@/components/transactions/TransactionsList'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}))

vi.mock('@/components/transactions/SettleTransactionDialog', () => ({
  SettleTransactionDialog: ({ trigger }: { trigger: React.ReactNode }) => <>{trigger}</>,
}))

vi.mock('@/components/shared/CancelConfirmDialog', () => ({
  CancelConfirmDialog: ({ trigger }: { trigger: React.ReactNode }) => <>{trigger}</>,
}))

describe('transactions list', () => {
  it('renders the new transaction contract fields and status labels', () => {
    render(
      <TransactionsList
        accounts={[]}
        transactions={[
          {
            id: 1,
            description: 'Internet',
            type: 'EXPENSE',
            value: '129.90',
            status: 'PENDING',
            competenceDate: new Date('2026-03-01T00:00:00.000Z'),
            dueDate: new Date('2026-03-10T00:00:00.000Z'),
            paidAt: new Date('2026-03-09T00:00:00.000Z'),
            category: { name: 'Moradia' },
          },
        ]}
      />,
    )

    expect(screen.getByText('Competência')).toBeInTheDocument()
    expect(screen.getByText('Vencimento')).toBeInTheDocument()
    expect(screen.getByText('Pagamento')).toBeInTheDocument()
    expect(screen.getByText('Pendente')).toBeInTheDocument()
    expect(screen.getByText('Internet')).toBeInTheDocument()
    expect(screen.getByText('Moradia')).toBeInTheDocument()
    expect(screen.getByText('28/02/2026')).toBeInTheDocument()
    expect(screen.getByText('09/03/2026')).toBeInTheDocument()
    expect(screen.getByText('08/03/2026')).toBeInTheDocument()
  })
})
