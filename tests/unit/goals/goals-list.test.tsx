// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { GoalsList } from '@/components/goals/GoalsList'

describe('GoalsList', () => {
  it('renders goal progress, targets and reserve linkage', () => {
    render(
      <GoalsList
        goals={[
          {
            id: 1,
            userId: 'user-1',
            name: 'Reserva de emergência',
            targetAmount: '10000.00',
            currentAmount: '2500.00',
            reserveAccountId: 3,
            status: 'ACTIVE',
            description: null,
            createdAt: new Date('2026-03-31'),
            updatedAt: new Date('2026-03-31'),
          },
          {
            id: 2,
            userId: 'user-1',
            name: 'Viagem',
            targetAmount: '4000.00',
            currentAmount: '4000.00',
            reserveAccountId: null,
            status: 'COMPLETED',
            description: null,
            createdAt: new Date('2026-03-31'),
            updatedAt: new Date('2026-03-31'),
          },
        ]}
      />,
    )

    expect(screen.getByText('Reserva de emergência')).toBeInTheDocument()
    expect(screen.getByText('Viagem')).toBeInTheDocument()
    expect(screen.getByText(/R\$ 2\.500,00 de R\$ 10\.000,00/)).toBeInTheDocument()
    expect(screen.getByText(/R\$ 4\.000,00 de R\$ 4\.000,00/)).toBeInTheDocument()
    expect(screen.getByText('Conta de reserva #3')).toBeInTheDocument()
    expect(screen.getByText('Meta concluída')).toBeInTheDocument()
    expect(screen.getByText('Progresso manual')).toBeInTheDocument()
    expect(
      screen.getByText('Aportes podem ser apenas informacionais ou refletir financeiramente via transferência.'),
    ).toBeInTheDocument()
  })
})
