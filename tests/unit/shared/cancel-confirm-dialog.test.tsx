// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../setup/render'
import { CancelConfirmDialog } from '@/components/shared/CancelConfirmDialog'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

describe('CancelConfirmDialog', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders dialog with trigger', () => {
    renderWithProviders(
      <CancelConfirmDialog
        entityType="transaction"
        entityId={1}
        entityDescription="Compra no mercado"
        trigger={<button>Cancelar transação</button>}
      />,
    )

    expect(screen.getByRole('button', { name: 'Cancelar transação' })).toBeInTheDocument()
  })

  it('shows correct title for transaction entityType', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <CancelConfirmDialog
        entityType="transaction"
        entityId={1}
        entityDescription="Compra no mercado"
        trigger={<button>Cancelar transação</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Cancelar transação' }))

    expect(screen.getByText('Cancelar transação', { selector: '[role="dialog"] *' })).toBeInTheDocument()
  })

  it('shows entity description in confirmation message', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <CancelConfirmDialog
        entityType="transaction"
        entityId={1}
        entityDescription="Compra no mercado"
        trigger={<button>Abrir</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Abrir' }))

    expect(
      screen.getByText(/Tem certeza que deseja cancelar 'Compra no mercado'\? Esta ação não pode ser desfeita\./),
    ).toBeInTheDocument()
  })

  it('has back and cancel buttons', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <CancelConfirmDialog
        entityType="transfer"
        entityId={2}
        entityDescription="Transferência PIX"
        trigger={<button>Abrir</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Abrir' }))

    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })
})
