// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { InvoiceDetails } from '@/components/invoices/InvoiceDetails'

describe('InvoiceDetails', () => {
  it('renders invoice summary, linked card data and installment history', () => {
    render(
      <InvoiceDetails
        invoice={{
          id: 7,
          month: 3,
          year: 2026,
          status: 'OPEN',
          total: '1250.40',
          dueDate: new Date('2026-04-15T00:00:00.000Z'),
          creditCard: {
            id: 2,
            name: 'Nubank',
            closeDay: 10,
            dueDay: 15,
            color: '#7a2cff',
            icon: 'credit-card',
          },
          transactions: [
            {
              id: 1,
              description: 'Notebook',
              value: '1200.00',
              status: 'PAID',
              competenceDate: new Date('2026-03-08T00:00:00.000Z'),
              dueDate: new Date('2026-03-15T00:00:00.000Z'),
              paidAt: new Date('2026-03-09T00:00:00.000Z'),
              installmentGroupId: 'group-1',
              installment: 1,
              installments: 3,
            },
            {
              id: 2,
              description: 'Notebook',
              value: '1200.00',
              status: 'PAID',
              competenceDate: new Date('2026-04-08T00:00:00.000Z'),
              dueDate: new Date('2026-04-15T00:00:00.000Z'),
              paidAt: new Date('2026-03-09T00:00:00.000Z'),
              installmentGroupId: 'group-1',
              installment: 2,
              installments: 3,
            },
          ],
        }}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Fatura #7' })).toBeInTheDocument()
    expect(screen.getByText('Cartão Nubank')).toBeInTheDocument()
    expect(screen.getByText('R$ 1.250,40')).toBeInTheDocument()
    expect(screen.getByText('03/2026')).toBeInTheDocument()
    expect(screen.getByText('Aberta')).toBeInTheDocument()
    expect(screen.getByText('15/04/2026')).toBeInTheDocument()
    expect(screen.getByText(/quita a obrigação do cartão/)).toBeInTheDocument()
    expect(screen.getAllByText('Notebook')).toHaveLength(2)
    expect(screen.getByText('Parcela 1 de 3')).toBeInTheDocument()
    expect(screen.getByText('Parcela 2 de 3')).toBeInTheDocument()
  })
})
