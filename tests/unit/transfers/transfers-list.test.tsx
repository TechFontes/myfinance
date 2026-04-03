// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

import { TransfersList } from '@/components/transfers/TransfersList'

afterEach(() => {
  cleanup()
})

describe('TransfersList', () => {
  it('renders transfer metadata using the internal movement vocabulary', () => {
    render(
      <TransfersList
        transfers={[
          {
            id: 1,
            sourceAccountLabel: 'Conta #10',
            destinationAccountLabel: 'Conta #11',
            amount: '150.00',
            description: 'Reserva mensal',
            competenceDate: '2026-03-31',
            dueDate: '2026-04-01',
            paidAt: '2026-03-31',
            status: 'PAID',
          },
          {
            id: 2,
            sourceAccountLabel: 'Conta #11',
            destinationAccountLabel: 'Conta #12',
            amount: '50.00',
            description: 'Aporte meta',
            competenceDate: '2026-03-30',
            dueDate: '2026-04-02',
            paidAt: null,
            status: 'PLANNED',
          },
        ]}
      />,
    )

    expect(screen.getByTestId('transfers-list')).toHaveTextContent('Conta #10')
    expect(screen.getByTestId('transfers-list')).toHaveTextContent('Conta #11')
    expect(screen.getByTestId('transfers-list')).toHaveTextContent('Conta #12')
    expect(screen.getByTestId('transfers-list')).toHaveTextContent('R$ 150,00')
    expect(screen.getByTestId('transfers-list')).toHaveTextContent('R$ 50,00')
    expect(screen.getByTestId('transfers-list')).toHaveTextContent('Paga')
    expect(screen.getByTestId('transfers-list')).toHaveTextContent('Prevista')
    expect(screen.getAllByRole('link', { name: 'Editar' })[0]).toHaveAttribute(
      'href',
      '/dashboard/transfers/1',
    )
  })

  it('renders a fallback label when the transfer description is missing', () => {
    render(
      <TransfersList
        transfers={[
          {
            id: 3,
            sourceAccountLabel: 'Conta #20',
            destinationAccountLabel: 'Conta #21',
            amount: '25.00',
            description: null,
            competenceDate: '2026-03-31',
            dueDate: '2026-04-01',
            paidAt: null,
            status: 'PENDING',
          },
        ]}
      />,
    )

    const latestList = screen.getAllByTestId('transfers-list').at(-1)

    expect(latestList).toHaveTextContent('Transferência interna')
    expect(latestList).toHaveTextContent('Pendente')
  })
})
