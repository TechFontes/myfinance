// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { GoalsList } from '@/components/goals/GoalsList'

const routerMock = vi.hoisted(() => ({
  refresh: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: routerMock.refresh,
  }),
}))

describe('GoalsList', () => {
  it('renders goal progress, targets and reserve linkage', () => {
    render(
      <GoalsList
        accounts={[
          { id: 3, name: 'Conta reserva' },
          { id: 7, name: 'Conta principal' },
        ]}
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
    expect(screen.getByText('Conta reserva')).toBeInTheDocument()
    expect(screen.getByText('Meta concluída')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Aportar' })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'Resgatar' })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'Ajustar' })).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Editar Reserva de emergência' })).toHaveAttribute(
      'href',
      '/dashboard/goals/1/edit',
    )
  })
})
