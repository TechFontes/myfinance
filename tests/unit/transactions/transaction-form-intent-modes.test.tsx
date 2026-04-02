// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TransactionForm } from '@/components/transactions/TransactionForm'

const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
  back: vi.fn(),
}))

const fetchMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: routerMock.push,
    back: routerMock.back,
  }),
}))

type PrototypeMethod<T> = T | undefined

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

const options = {
  categories: [
    { id: 11, name: 'Mercado', type: 'EXPENSE' as const },
    { id: 12, name: 'Salário', type: 'INCOME' as const },
  ],
  accounts: [{ id: 21, name: 'Conta Principal' }],
  cards: [{ id: 31, name: 'Cartão Azul' }],
}

function applyElementShims() {
  elementPrototype.hasPointerCapture = () => false
  elementPrototype.releasePointerCapture = () => undefined
  elementPrototype.setPointerCapture = () => undefined
  elementPrototype.scrollIntoView = () => undefined
}

function restoreElementShims() {
  const restorations: Array<[keyof typeof elementPrototype, PrototypeMethod<unknown>]> = [
    ['hasPointerCapture', originalHasPointerCapture],
    ['releasePointerCapture', originalReleasePointerCapture],
    ['setPointerCapture', originalSetPointerCapture],
    ['scrollIntoView', originalScrollIntoView],
  ]

  for (const [key, original] of restorations) {
    if (original === undefined) {
      delete elementPrototype[key]
      continue
    }

    elementPrototype[key] = original as never
  }
}

function getSelectField(labelText: string) {
  const label = screen.getByText(labelText, { selector: 'label' })
  const field = label.closest('div.space-y-2')

  if (!field) {
    throw new Error(`Missing field wrapper for select "${labelText}"`)
  }

  return field
}

function getSelectTrigger(labelText: string) {
  const field = getSelectField(labelText)
  const trigger = within(field).getByRole('combobox', { name: labelText })
  const triggerId = trigger.getAttribute('id')

  if (!triggerId) {
    throw new Error(`Missing trigger id for select "${labelText}"`)
  }

  const element = document.getElementById(triggerId)

  if (!element) {
    throw new Error(`Missing select trigger element for "${labelText}"`)
  }

  return element
}

async function selectOption(user: ReturnType<typeof userEvent.setup>, name: string, optionText: string) {
  await user.click(getSelectTrigger(name))
  await user.click(await screen.findByRole('option', { name: optionText }))
}

describe('transaction form intent modes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    applyElementShims()
  })

  afterEach(() => {
    cleanup()
    restoreElementShims()
  })

  it('starts with only the intent selector and reveals account-specific fields for cash expense', async () => {
    const user = userEvent.setup()

    render(<TransactionForm options={options} />)

    expect(screen.getByRole('heading', { name: 'Como deseja registrar?' })).toBeInTheDocument()
    expect(screen.queryByText('Conta', { selector: 'label' })).not.toBeInTheDocument()
    expect(screen.queryByText('Cartão', { selector: 'label' })).not.toBeInTheDocument()
    expect(screen.queryByText('Fatura', { selector: 'label' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Despesa em conta/i }))

    expect(screen.getByText('Conta', { selector: 'label' })).toBeInTheDocument()
    expect(screen.queryByText('Cartão', { selector: 'label' })).not.toBeInTheDocument()
    expect(screen.queryByText('Fatura', { selector: 'label' })).not.toBeInTheDocument()
    expect(screen.queryByText('Parcela atual', { selector: 'label' })).not.toBeInTheDocument()
    expect(screen.queryByText('Total de parcelas', { selector: 'label' })).not.toBeInTheDocument()
  })

  it('shows card and installment controls only for card purchases', async () => {
    const user = userEvent.setup()

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 41, month: 4, year: 2026 }],
    })

    render(<TransactionForm options={options} />)

    await user.click(screen.getByRole('button', { name: /Compra no cartão/i }))

    expect(screen.queryByText('Conta', { selector: 'label' })).not.toBeInTheDocument()
    expect(screen.getByText('Cartão', { selector: 'label' })).toBeInTheDocument()
    expect(screen.getByText('Fatura', { selector: 'label' })).toBeInTheDocument()
    expect(screen.getByText('Parcela atual', { selector: 'label' })).toBeInTheDocument()
    expect(screen.getByText('Total de parcelas', { selector: 'label' })).toBeInTheDocument()

    await selectOption(user, 'Cartão', 'Cartão Azul')

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/invoices?creditCardId=31',
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      )
    })
  })

  it('reveals the payment date only when the status is paid', async () => {
    const user = userEvent.setup()

    render(<TransactionForm options={options} />)

    await user.click(screen.getByRole('button', { name: /Receita/i }))

    expect(screen.queryByText('Pagamento', { selector: 'label' })).not.toBeInTheDocument()

    await selectOption(user, 'Status', 'Paga')

    expect(screen.getByText('Pagamento', { selector: 'label' })).toBeInTheDocument()
  })
})
