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
  cards: [
    { id: 31, name: 'Cartão Azul' },
    { id: 32, name: 'Cartão Verde' },
  ],
}

function createDeferredResponse<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve
  })

  return { promise, resolve }
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

describe('transaction form', () => {
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

  it('renders selection controls instead of raw ID inputs', async () => {
    const user = userEvent.setup()

    render(<TransactionForm options={options} />)

    expect(screen.getByRole('heading', { name: 'Nova transação' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Como deseja registrar?' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Compra no cartão/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Compra no cartão/i }))

    expect(within(getSelectField('Categoria')).getByRole('combobox', { name: 'Categoria' })).toBeInTheDocument()
    expect(within(getSelectField('Cartão')).getByRole('combobox', { name: 'Cartão' })).toBeInTheDocument()
    expect(within(getSelectField('Fatura')).getByRole('combobox', { name: 'Fatura' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Categoria ID')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Conta ID opcional')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Cartão ID opcional')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Fatura ID opcional')).not.toBeInTheDocument()
  })

  it('loads invoices for the selected card and submits normalized numeric ids', async () => {
    const user = userEvent.setup()

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 41, month: 4, year: 2026, total: '120.00' }],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 100 }),
      })

    render(<TransactionForm options={options} />)

    await user.click(screen.getByRole('button', { name: /Compra no cartão/i }))
    await selectOption(user, 'Categoria', 'Mercado')
    await selectOption(user, 'Cartão', 'Cartão Azul')

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/invoices?creditCardId=31',
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      )
    })

    await user.click(getSelectTrigger('Fatura'))
    await user.click(await screen.findByRole('option', { name: '04/2026' }))

    await user.type(screen.getByLabelText('Descrição'), 'Supermercado do mês')
    await user.type(screen.getByLabelText('Valor'), '89.90')
    await user.type(screen.getByLabelText('Competência'), '2026-04-01')
    await user.type(screen.getByLabelText('Vencimento'), '2026-04-05')
    await user.click(screen.getByRole('button', { name: 'Salvar transação' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        '/api/transactions',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    })

    const [, request] = fetchMock.mock.calls[1]
    expect(JSON.parse(request.body)).toMatchObject({
      categoryId: 11,
      accountId: null,
      creditCardId: 31,
      invoiceId: 41,
      paidAt: null,
      installment: null,
      installments: null,
    })
    expect(routerMock.push).toHaveBeenCalledWith('/dashboard/transactions')
  })

  it('keeps invoice options aligned with the latest selected card when requests resolve out of order', async () => {
    const user = userEvent.setup()
    const firstInvoices = createDeferredResponse<{ ok: boolean; json: () => Promise<{ id: number; month: number; year: number }[]> }>()
    const secondInvoices = createDeferredResponse<{ ok: boolean; json: () => Promise<{ id: number; month: number; year: number }[]> }>()

    fetchMock
      .mockImplementationOnce(() => firstInvoices.promise)
      .mockImplementationOnce(() => secondInvoices.promise)

    render(<TransactionForm options={options} />)

    await user.click(screen.getByRole('button', { name: /Compra no cartão/i }))
    await selectOption(user, 'Cartão', 'Cartão Azul')
    await selectOption(user, 'Cartão', 'Cartão Verde')

    secondInvoices.resolve({
      ok: true,
      json: async () => [{ id: 52, month: 6, year: 2026 }],
    })

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        '/api/invoices?creditCardId=32',
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      )
    })

    firstInvoices.resolve({
      ok: true,
      json: async () => [{ id: 51, month: 5, year: 2026 }],
    })

    await user.click(getSelectTrigger('Fatura'))

    expect(await screen.findByRole('option', { name: '06/2026' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: '05/2026' })).not.toBeInTheDocument()
  })
})
