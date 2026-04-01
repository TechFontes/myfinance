// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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

const options = {
  categories: [
    { id: 11, name: 'Mercado', type: 'EXPENSE' as const },
    { id: 12, name: 'Salário', type: 'INCOME' as const },
  ],
  accounts: [{ id: 21, name: 'Conta Principal' }],
  cards: [{ id: 31, name: 'Cartão Azul' }],
}

async function selectOption(user: ReturnType<typeof userEvent.setup>, name: string, optionText: string) {
  await user.click(screen.getByRole('combobox', { name }))
  await user.click(await screen.findByRole('option', { name: optionText }))
}

describe('transaction form', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('renders selection controls instead of raw ID inputs', () => {
    render(<TransactionForm options={options} />)

    expect(screen.getByRole('heading', { name: 'Nova transação' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Categoria' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Conta' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Cartão' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Fatura' })).toBeInTheDocument()
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

    await selectOption(user, 'Categoria', 'Mercado')
    await selectOption(user, 'Conta', 'Conta Principal')
    await selectOption(user, 'Cartão', 'Cartão Azul')

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/invoices?creditCardId=31')
    })

    await user.click(screen.getByRole('combobox', { name: 'Fatura' }))
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
      accountId: 21,
      creditCardId: 31,
      invoiceId: 41,
      paidAt: null,
      installment: null,
      installments: null,
    })
    expect(routerMock.push).toHaveBeenCalledWith('/dashboard/transactions')
  })
})
