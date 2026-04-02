import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTransactionForUser } from '@/modules/transactions/service'
import { createTransferForUser } from '@/modules/transfers/service'
import { createGoalForUser } from '@/modules/goals/service'

const prismaMock = vi.hoisted(() => ({
  transaction: {
    create: vi.fn(),
  },
  transfer: {
    create: vi.fn(),
  },
  goal: {
    create: vi.fn(),
  },
  account: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
  },
  creditCard: {
    findFirst: vi.fn(),
  },
  invoice: {
    findFirst: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

describe('financial invariants', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects transactions that link account and credit card at the same time', async () => {
    await expect(
      createTransactionForUser('user-1', {
        type: 'EXPENSE',
        description: 'Compra ambigua',
        value: '99.90',
        categoryId: 12,
        accountId: 3,
        creditCardId: 8,
        competenceDate: new Date('2026-04-01T00:00:00.000Z'),
        dueDate: new Date('2026-04-01T00:00:00.000Z'),
      }),
    ).rejects.toMatchObject({
      code: 'TRANSACTION_ACCOUNT_CARD_CONFLICT',
    })

    expect(prismaMock.transaction.create).not.toHaveBeenCalled()
  })

  it('rejects paid transactions without paidAt', async () => {
    await expect(
      createTransactionForUser('user-1', {
        type: 'EXPENSE',
        description: 'Despesa paga sem data',
        value: '49.90',
        categoryId: 12,
        status: 'PAID',
        competenceDate: new Date('2026-04-01T00:00:00.000Z'),
        dueDate: new Date('2026-04-01T00:00:00.000Z'),
      }),
    ).rejects.toMatchObject({
      code: 'TRANSACTION_PAID_AT_REQUIRED',
    })

    expect(prismaMock.transaction.create).not.toHaveBeenCalled()
  })

  it('rejects transactions whose account does not belong to the user', async () => {
    prismaMock.account.findFirst.mockResolvedValueOnce(null)

    await expect(
      createTransactionForUser('user-1', {
        type: 'EXPENSE',
        description: 'Conta de outro usuario',
        value: '89.90',
        categoryId: 12,
        accountId: 44,
        competenceDate: new Date('2026-04-01T00:00:00.000Z'),
        dueDate: new Date('2026-04-01T00:00:00.000Z'),
      }),
    ).rejects.toMatchObject({
      code: 'TRANSACTION_ACCOUNT_OWNERSHIP',
    })

    expect(prismaMock.transaction.create).not.toHaveBeenCalled()
  })

  it('rejects transactions whose credit card does not belong to the user', async () => {
    prismaMock.creditCard.findFirst.mockResolvedValueOnce(null)

    await expect(
      createTransactionForUser('user-1', {
        type: 'EXPENSE',
        description: 'Cartao de outro usuario',
        value: '129.90',
        categoryId: 12,
        creditCardId: 88,
        competenceDate: new Date('2026-04-01T00:00:00.000Z'),
        dueDate: new Date('2026-04-10T00:00:00.000Z'),
      }),
    ).rejects.toMatchObject({
      code: 'TRANSACTION_CARD_OWNERSHIP',
    })

    expect(prismaMock.transaction.create).not.toHaveBeenCalled()
  })

  it('rejects transactions whose invoice does not belong to the selected credit card', async () => {
    prismaMock.creditCard.findFirst.mockResolvedValueOnce({
      id: 8,
      userId: 'user-1',
    })
    prismaMock.invoice.findFirst.mockResolvedValueOnce(null)

    await expect(
      createTransactionForUser('user-1', {
        type: 'EXPENSE',
        description: 'Compra no cartao',
        value: '199.90',
        categoryId: 12,
        creditCardId: 8,
        invoiceId: 99,
        competenceDate: new Date('2026-04-01T00:00:00.000Z'),
        dueDate: new Date('2026-04-10T00:00:00.000Z'),
      }),
    ).rejects.toMatchObject({
      code: 'TRANSACTION_INVOICE_CARD_MISMATCH',
    })

    expect(prismaMock.transaction.create).not.toHaveBeenCalled()
  })

  it('rejects transfers when source and destination accounts are not both owned by the user', async () => {
    prismaMock.account.findMany.mockResolvedValueOnce([
      { id: 1, userId: 'user-1' },
    ])

    await expect(
      createTransferForUser('user-1', {
        sourceAccountId: 1,
        destinationAccountId: 2,
        amount: '250.00',
        description: 'Transferencia invalida',
        competenceDate: '2026-04-03',
        dueDate: '2026-04-03',
      }),
    ).rejects.toMatchObject({
      code: 'TRANSFER_ACCOUNT_OWNERSHIP',
    })

    expect(prismaMock.transfer.create).not.toHaveBeenCalled()
  })

  it('rejects goals that reference a reserve account owned by another user', async () => {
    prismaMock.account.findFirst.mockResolvedValueOnce(null)

    await expect(
      createGoalForUser('user-1', {
        name: 'Reserva segura',
        targetAmount: '5000.00',
        reserveAccountId: 77,
      }),
    ).rejects.toMatchObject({
      code: 'GOAL_RESERVE_ACCOUNT_OWNERSHIP',
    })

    expect(prismaMock.goal.create).not.toHaveBeenCalled()
  })
})
