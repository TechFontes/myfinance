// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TransfersList } from '@/components/transfers/TransfersList'

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
  })
})
