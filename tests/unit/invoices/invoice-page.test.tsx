// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const prismaMock = vi.hoisted(() => ({
  invoice: {
    findFirst: vi.fn(),
  },
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

describe('invoice page', () => {
  it('renders the invoice detail view for the current user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    prismaMock.invoice.findFirst.mockResolvedValue({
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
      ],
    })

    const { default: InvoicePage } = await import('@/dashboard/invoices/[invoiceId]/page')
    render(await InvoicePage({ params: Promise.resolve({ invoiceId: '7' }) }))

    expect(screen.getByRole('heading', { name: 'Fatura #7' })).toBeInTheDocument()
    expect(screen.getByText('Cartão Nubank')).toBeInTheDocument()
    expect(screen.getByText('R$ 1.250,40')).toBeInTheDocument()
    expect(screen.getByText('03/2026')).toBeInTheDocument()
    expect(prismaMock.invoice.findFirst).toHaveBeenCalledWith({
      where: {
        id: 7,
        creditCard: {
          userId: 'user-1',
        },
      },
      include: {
        creditCard: true,
        transactions: {
          orderBy: [{ competenceDate: 'asc' }, { installment: 'asc' }, { id: 'asc' }],
        },
      },
    })
  })
})
