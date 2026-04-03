// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

import { TransfersList } from '@/components/transfers/TransfersList'

afterEach(() => {
  cleanup()
})

const planned = {
  id: 1,
  sourceAccountLabel: 'Conta A',
  destinationAccountLabel: 'Conta B',
  amount: '100.00',
  description: 'Reserva mensal',
  competenceDate: '2026-03-01',
  dueDate: '2026-03-15',
  paidAt: null,
  status: 'PLANNED' as const,
}

const paid = {
  id: 2,
  sourceAccountLabel: 'Conta A',
  destinationAccountLabel: 'Conta C',
  amount: '200.00',
  description: 'Aporte investimento',
  competenceDate: '2026-03-01',
  dueDate: '2026-03-10',
  paidAt: '2026-03-10',
  status: 'PAID' as const,
}

const canceled = {
  id: 3,
  sourceAccountLabel: 'Conta B',
  destinationAccountLabel: 'Conta C',
  amount: '50.00',
  description: 'Transferência cancelada',
  competenceDate: '2026-03-01',
  dueDate: '2026-03-20',
  paidAt: null,
  status: 'CANCELED' as const,
}

describe('TransfersList quick actions', () => {
  it('shows "Liquidar" button for PLANNED transfers', () => {
    render(<TransfersList transfers={[planned]} />)

    const buttons = screen.getAllByRole('button', { name: 'Liquidar' })
    expect(buttons).toHaveLength(1)
  })

  it('does not show "Liquidar" button for PAID transfers', () => {
    render(<TransfersList transfers={[paid]} />)

    expect(screen.queryByRole('button', { name: 'Liquidar' })).toBeNull()
  })

  it('does not show "Liquidar" button for CANCELED transfers', () => {
    render(<TransfersList transfers={[canceled]} />)

    expect(screen.queryByRole('button', { name: 'Liquidar' })).toBeNull()
  })

  it('shows "Cancelar" button for PLANNED and PAID transfers', () => {
    render(<TransfersList transfers={[planned, paid]} />)

    const buttons = screen.getAllByRole('button', { name: 'Cancelar' })
    expect(buttons).toHaveLength(2)
  })

  it('does not show "Cancelar" button for CANCELED transfers', () => {
    render(<TransfersList transfers={[canceled]} />)

    expect(screen.queryByRole('button', { name: 'Cancelar' })).toBeNull()
  })

  it('renders all three action states correctly together', () => {
    render(<TransfersList transfers={[planned, paid, canceled]} />)

    // PLANNED: has both Liquidar and Cancelar
    const liquidarButtons = screen.getAllByRole('button', { name: 'Liquidar' })
    expect(liquidarButtons).toHaveLength(1)

    // PLANNED + PAID: both have Cancelar, CANCELED does not
    const cancelarButtons = screen.getAllByRole('button', { name: 'Cancelar' })
    expect(cancelarButtons).toHaveLength(2)

    // All three have Editar links
    const editarLinks = screen.getAllByRole('link', { name: 'Editar' })
    expect(editarLinks).toHaveLength(3)
  })
})
