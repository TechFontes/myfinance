import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getInvoiceByIdForUser,
  listInvoicesByCard,
  payInvoiceForUser,
} from '@/modules/invoices/service'

const prismaMock = vi.hoisted(() => ({
  invoice: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

describe('invoice reconciliation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('derives invoice totals from linked card purchases in the card list', async () => {
    prismaMock.invoice.findMany.mockResolvedValue([
      {
        id: 4,
        creditCardId: 7,
        month: 4,
        year: 2026,
        dueDate: new Date('2026-04-20T00:00:00.000Z'),
        status: 'OPEN',
        total: { toString: () => '999.99' },
        transactions: [
          { id: 1, value: '120.00', status: 'PENDING' },
          { id: 2, value: '80.00', status: 'PENDING' },
          { id: 3, value: '50.00', status: 'CANCELED' },
        ],
        creditCard: { id: 7, userId: 'user-1' },
      },
    ] as never)

    const invoices = await listInvoicesByCard('user-1', 7)

    expect(prismaMock.invoice.findMany).toHaveBeenCalledWith({
      where: {
        creditCardId: 7,
        creditCard: {
          userId: 'user-1',
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        creditCard: true,
        transactions: {
          orderBy: [
            { competenceDate: 'asc' },
            { installment: 'asc' },
            { id: 'asc' },
          ],
        },
      },
    })
    expect(invoices[0]).toMatchObject({
      id: 4,
      total: '200.00',
      status: 'OPEN',
    })
  })

  it('derives invoice totals in the owned detail read model', async () => {
    prismaMock.invoice.findFirst.mockResolvedValue({
      id: 10,
      creditCardId: 7,
      month: 4,
      year: 2026,
      dueDate: new Date('2026-04-20T00:00:00.000Z'),
      status: 'OPEN',
      total: { toString: () => '1.00' },
      transactions: [
        { id: 1, value: '300.00', status: 'PENDING' },
        { id: 2, value: '25.00', status: 'CANCELED' },
      ],
      creditCard: { id: 7, userId: 'user-1' },
    } as never)

    const invoice = await getInvoiceByIdForUser('user-1', 10)

    expect(prismaMock.invoice.findFirst).toHaveBeenCalledWith({
      where: {
        id: 10,
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
    expect(invoice).toMatchObject({
      id: 10,
      total: '300.00',
      status: 'OPEN',
    })
  })

  it('marks the owned invoice as paid through command flow and returns the derived total', async () => {
    prismaMock.invoice.findFirst.mockResolvedValue({
      id: 10,
      creditCardId: 7,
      month: 4,
      year: 2026,
      dueDate: new Date('2026-04-20T00:00:00.000Z'),
      status: 'OPEN',
      total: { toString: () => '1.00' },
      transactions: [
        { id: 1, value: '120.00', status: 'PENDING' },
        { id: 2, value: '80.00', status: 'PENDING' },
      ],
      creditCard: { id: 7, userId: 'user-1' },
    } as never)
    prismaMock.invoice.update.mockResolvedValue({
      id: 10,
      creditCardId: 7,
      month: 4,
      year: 2026,
      dueDate: new Date('2026-04-20T00:00:00.000Z'),
      status: 'PAID',
      total: { toString: () => '1.00' },
      transactions: [
        { id: 1, value: '120.00', status: 'PENDING' },
        { id: 2, value: '80.00', status: 'PENDING' },
      ],
      creditCard: { id: 7, userId: 'user-1' },
    } as never)

    const invoice = await payInvoiceForUser('user-1', 10)

    expect(prismaMock.invoice.findFirst).toHaveBeenCalledWith({
      where: {
        id: 10,
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
    expect(prismaMock.invoice.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: {
        status: 'PAID',
      },
      include: {
        creditCard: true,
        transactions: {
          orderBy: [{ competenceDate: 'asc' }, { installment: 'asc' }, { id: 'asc' }],
        },
      },
    })
    expect(invoice).toMatchObject({
      id: 10,
      total: '200.00',
      status: 'PAID',
    })
  })
})
