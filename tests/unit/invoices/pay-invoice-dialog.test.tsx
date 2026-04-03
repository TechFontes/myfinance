// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PayInvoiceDialog } from '@/components/invoices/PayInvoiceDialog'
import { InvoiceDetails } from '@/components/invoices/InvoiceDetails'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}))

afterEach(() => {
  cleanup()
})

const accounts = [
  { id: 1, name: 'Nubank' },
  { id: 2, name: 'Itaú' },
]

const categories = [
  { id: 10, name: 'Cartão de crédito' },
  { id: 11, name: 'Moradia' },
]

describe('PayInvoiceDialog', () => {
  it('renders dialog with trigger', () => {
    render(
      <PayInvoiceDialog
        invoiceId={7}
        accounts={accounts}
        categories={categories}
        trigger={<button>Pagar Fatura</button>}
      />,
    )

    expect(screen.getByRole('button', { name: 'Pagar Fatura' })).toBeInTheDocument()
  })

  it('opens dialog on trigger click', async () => {
    const user = userEvent.setup()

    render(
      <PayInvoiceDialog
        invoiceId={7}
        accounts={accounts}
        categories={categories}
        trigger={<button>Pagar Fatura</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Pagar Fatura' }))

    expect(screen.getByText('Pagar fatura')).toBeInTheDocument()
    expect(screen.getByText('Selecione a conta, categoria e data de pagamento')).toBeInTheDocument()
  })

  it('has account select, category select and date input', async () => {
    const user = userEvent.setup()

    render(
      <PayInvoiceDialog
        invoiceId={7}
        accounts={accounts}
        categories={categories}
        trigger={<button>Pagar Fatura</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Pagar Fatura' }))

    expect(screen.getByLabelText('Conta')).toBeInTheDocument()
    expect(screen.getByLabelText('Categoria')).toBeInTheDocument()
    expect(screen.getByLabelText('Data de pagamento')).toBeInTheDocument()
  })
})

describe('InvoiceDetails - Pagar Fatura button', () => {
  const baseInvoice = {
    id: 7,
    month: 3,
    year: 2026,
    total: '1250.40',
    dueDate: new Date('2026-04-15T00:00:00.000Z'),
    creditCard: {
      id: 2,
      name: 'Nubank',
      closeDay: 10,
      dueDay: 15,
    },
    transactions: [],
  } as const

  it('does not show "Pagar Fatura" button when status is PAID', () => {
    render(
      <InvoiceDetails
        invoice={{ ...baseInvoice, status: 'PAID' }}
        accounts={accounts}
        categories={categories}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Pagar Fatura' })).not.toBeInTheDocument()
  })

  it('does not show "Pagar Fatura" button when status is CANCELED', () => {
    render(
      <InvoiceDetails
        invoice={{ ...baseInvoice, status: 'CANCELED' }}
        accounts={accounts}
        categories={categories}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Pagar Fatura' })).not.toBeInTheDocument()
  })

  it('shows "Pagar Fatura" button when status is OPEN', () => {
    render(
      <InvoiceDetails
        invoice={{ ...baseInvoice, status: 'OPEN' }}
        accounts={accounts}
        categories={categories}
      />,
    )

    expect(screen.getByRole('button', { name: 'Pagar Fatura' })).toBeInTheDocument()
  })
})
