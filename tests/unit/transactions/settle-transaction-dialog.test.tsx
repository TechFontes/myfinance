// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SettleTransactionDialog } from '@/components/transactions/SettleTransactionDialog'

const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
  back: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => routerMock,
}))

const elementPrototype = HTMLElement.prototype as HTMLElement & {
  hasPointerCapture?: (pointerId: number) => boolean
  releasePointerCapture?: (pointerId: number) => void
  setPointerCapture?: (pointerId: number) => void
  scrollIntoView?: (options?: ScrollIntoViewOptions) => void
}

const originalHasPointerCapture = elementPrototype.hasPointerCapture
const originalReleasePointerCapture = elementPrototype.releasePointerCapture
const originalSetPointerCapture = elementPrototype.setPointerCapture
const originalScrollIntoView = elementPrototype.scrollIntoView

const mockAccounts = [
  { id: 1, name: 'Conta Corrente' },
  { id: 2, name: 'Poupança' },
]

describe('SettleTransactionDialog', () => {
  beforeEach(() => {
    elementPrototype.hasPointerCapture = vi.fn(() => false)
    elementPrototype.releasePointerCapture = vi.fn()
    elementPrototype.setPointerCapture = vi.fn()
    elementPrototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    elementPrototype.hasPointerCapture = originalHasPointerCapture
    elementPrototype.releasePointerCapture = originalReleasePointerCapture
    elementPrototype.setPointerCapture = originalSetPointerCapture
    elementPrototype.scrollIntoView = originalScrollIntoView
  })

  it('opens dialog and shows account select and date input', async () => {
    const user = userEvent.setup()

    render(
      <SettleTransactionDialog
        transactionId={42}
        accounts={mockAccounts}
        trigger={<button>Liquidar</button>}
      />,
    )

    await user.click(screen.getByText('Liquidar'))

    expect(screen.getByText('Liquidar transação')).toBeInTheDocument()
    expect(screen.getByText('Selecione a conta e data de pagamento')).toBeInTheDocument()
    expect(screen.getByLabelText('Conta')).toBeInTheDocument()
    expect(screen.getByLabelText('Data de pagamento')).toBeInTheDocument()
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
  })

  it('shows validation error when submitting without selecting an account', async () => {
    const user = userEvent.setup()

    render(
      <SettleTransactionDialog
        transactionId={42}
        accounts={mockAccounts}
        trigger={<button>Liquidar</button>}
      />,
    )

    await user.click(screen.getByText('Liquidar'))

    const submitButtons = screen.getAllByText('Liquidar')
    const submitButton = submitButtons.find(
      (btn) => btn.closest('button')?.className.includes('emerald'),
    )
    expect(submitButton).toBeTruthy()
    await user.click(submitButton!)

    expect(screen.getByText('Selecione uma conta')).toBeInTheDocument()
  })

  it('submits successfully and calls onSuccess + router.refresh', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    })

    render(
      <SettleTransactionDialog
        transactionId={42}
        accounts={mockAccounts}
        trigger={<button>Liquidar</button>}
        onSuccess={onSuccess}
      />,
    )

    await user.click(screen.getByText('Liquidar'))

    // Open select and pick account
    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByText('Conta Corrente'))

    // Click submit
    const submitButtons = screen.getAllByText('Liquidar')
    const submitButton = submitButtons.find(
      (btn) => btn.closest('button')?.className.includes('emerald'),
    )
    await user.click(submitButton!)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/transactions/42/settle',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining('"accountId":1'),
        }),
      )
      expect(onSuccess).toHaveBeenCalled()
      expect(routerMock.refresh).toHaveBeenCalled()
    })
  })

  it('displays error when fetch fails', async () => {
    const user = userEvent.setup()

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Transação já liquidada' }),
    })

    render(
      <SettleTransactionDialog
        transactionId={42}
        accounts={mockAccounts}
        trigger={<button>Liquidar</button>}
      />,
    )

    await user.click(screen.getByText('Liquidar'))

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByText('Poupança'))

    const submitButtons = screen.getAllByText('Liquidar')
    const submitButton = submitButtons.find(
      (btn) => btn.closest('button')?.className.includes('emerald'),
    )
    await user.click(submitButton!)

    await waitFor(() => {
      expect(screen.getByText('Transação já liquidada')).toBeInTheDocument()
    })
  })
})
