import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildInvoiceDueDate,
  calculateInvoiceTotal,
  createInstallmentGroupId,
  groupInstallmentTransactions,
  listInvoicesByCard,
  resolveInvoicePeriod,
} from '@/modules/invoices/service'

const prismaMock = vi.hoisted(() => ({
  invoice: {
    findMany: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

describe('invoice service helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists invoices by credit card with transactions included', async () => {
    prismaMock.invoice.findMany.mockResolvedValue([
      {
        id: 1,
        creditCardId: 7,
        month: 4,
        year: 2026,
        status: 'OPEN',
        total: { toString: () => '0.00' },
        dueDate: new Date('2026-04-20T00:00:00.000Z'),
        creditCard: { id: 7 },
        transactions: [],
      },
    ] as never)

    await listInvoicesByCard('user-1', 7)

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
  })

  it('resolves invoice competence before the close day in the same month', () => {
    expect(
      resolveInvoicePeriod(new Date('2026-03-10T00:00:00.000Z'), 15, 20),
    ).toMatchObject({
      month: 3,
      year: 2026,
      dueDate: new Date('2026-03-20T00:00:00.000Z'),
    })
  })

  it('resolves invoice competence after the close day in the next month', () => {
    expect(
      resolveInvoicePeriod(new Date('2026-03-20T00:00:00.000Z'), 15, 20),
    ).toMatchObject({
      month: 4,
      year: 2026,
      dueDate: new Date('2026-04-20T00:00:00.000Z'),
    })
  })

  it('calculates invoice total while skipping canceled transactions', () => {
    expect(
      calculateInvoiceTotal([
        {
          id: 1,
          value: '120.50',
          status: 'OPEN',
          installmentGroupId: 'installment-1',
        },
        {
          id: 2,
          value: '79.50',
          status: 'OPEN',
          installmentGroupId: 'installment-1',
        },
        {
          id: 3,
          value: '25.00',
          status: 'CANCELED',
          installmentGroupId: null,
        },
      ]),
    ).toBe('200.00')
  })

  it('groups installments by installment group id for invoice display', () => {
    expect(
      groupInstallmentTransactions([
        {
          id: 1,
          installmentGroupId: 'installment-1',
          installment: 1,
          installments: 2,
        },
        {
          id: 2,
          installmentGroupId: 'installment-1',
          installment: 2,
          installments: 2,
        },
        {
          id: 3,
          installmentGroupId: null,
          installment: null,
          installments: null,
        },
      ]),
    ).toEqual([
      {
        installmentGroupId: 'installment-1',
        transactions: [
          {
            id: 1,
            installmentGroupId: 'installment-1',
            installment: 1,
            installments: 2,
          },
          {
            id: 2,
            installmentGroupId: 'installment-1',
            installment: 2,
            installments: 2,
          },
        ],
      },
      {
        installmentGroupId: null,
        transactions: [
          {
            id: 3,
            installmentGroupId: null,
            installment: null,
            installments: null,
          },
        ],
      },
    ])
  })

  it('creates distinct installment group ids', () => {
    const first = createInstallmentGroupId()
    const second = createInstallmentGroupId()

    expect(first).toMatch(/^[0-9a-f-]{36}$/)
    expect(second).toMatch(/^[0-9a-f-]{36}$/)
    expect(first).not.toBe(second)
  })

  it('builds a stable due date for the invoice period', () => {
    expect(buildInvoiceDueDate(2026, 4, 20)).toEqual(
      new Date('2026-04-20T00:00:00.000Z'),
    )
  })
})
