import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const cacheMock = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
}))

type TransactionRecord = {
  id: number
  userId: string
  type: 'INCOME' | 'EXPENSE'
  description: string
  value: string
  status: 'PLANNED' | 'PENDING' | 'PAID' | 'CANCELED'
  competenceDate: Date
  dueDate: Date
  paidAt: Date | null
  category: {
    id: number
    name: string
    type: 'INCOME' | 'EXPENSE'
  }
  account: {
    id: number
    name: string
    type: 'BANK' | 'WALLET' | 'OTHER'
  }
}

type AccountRecord = {
  id: number
  name: string
  type: 'BANK' | 'WALLET' | 'OTHER'
  initialBalance: string
  active: boolean
}

const prismaMock = vi.hoisted(() => {
  let transactionState: TransactionRecord[] = []
  let accountState: AccountRecord[] = []

  return {
    setState(input: { transactions: TransactionRecord[]; accounts: AccountRecord[] }) {
      transactionState = input.transactions.map((transaction) => ({ ...transaction }))
      accountState = input.accounts.map((account) => ({ ...account }))
    },
    transaction: {
      findMany: vi.fn((args?: { select?: { competenceDate?: boolean } }) => {
        const selectKeys = args?.select ? Object.keys(args.select) : []

        if (args?.select?.competenceDate && selectKeys.length === 1) {
          return Promise.resolve(
            transactionState
              .filter((transaction) => transaction.status !== 'CANCELED')
              .map((transaction) => ({
                competenceDate: transaction.competenceDate,
              })),
          )
        }

        return Promise.resolve(
          transactionState
            .filter((transaction) => transaction.status !== 'CANCELED')
            .map((transaction) => ({
              id: transaction.id,
              type: transaction.type,
              description: transaction.description,
              value: transaction.value,
              status: transaction.status,
              competenceDate: transaction.competenceDate,
              dueDate: transaction.dueDate,
              category: transaction.category,
              account: transaction.account,
            })),
        )
      }),
      findFirst: vi.fn((args?: { where?: { id?: number; userId?: string } }) => {
        const transaction = transactionState.find(
          (item) =>
            item.id === args?.where?.id && item.userId === args?.where?.userId,
        )

        return Promise.resolve(transaction ? { ...transaction } : null)
      }),
      update: vi.fn((args?: {
        where?: { id?: number }
        data?: Partial<TransactionRecord>
      }) => {
        const transaction = transactionState.find(
          (item) => item.id === args?.where?.id,
        )

        if (!transaction) {
          return Promise.resolve(null)
        }

        for (const [key, value] of Object.entries(args?.data ?? {})) {
          if (value !== undefined) {
            ;(transaction as Record<string, unknown>)[key] = value
          }
        }

        if (args?.data?.paidAt !== undefined) {
          transaction.paidAt = args.data.paidAt ?? null
        }

        return Promise.resolve({ ...transaction })
      }),
    },
    account: {
      findMany: vi.fn(() => Promise.resolve(accountState.map((account) => ({ ...account })))),
    },
    transfer: {
      findMany: vi.fn(() => Promise.resolve([])),
    },
    invoice: {
      findMany: vi.fn(() => Promise.resolve([])),
    },
  }
})

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))
vi.mock('next/cache', () => cacheMock)

import { GET as getDashboard } from '@/api/dashboard/route'
import { PATCH as patchTransaction } from '@/api/transactions/[transactionId]/route'

describe('dashboard freshness regression', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    prismaMock.setState({
      transactions: [
        {
          id: 10,
          userId: 'user-1',
          type: 'EXPENSE',
          description: 'Aluguel',
          value: '125.00',
          status: 'PENDING',
          competenceDate: new Date('2026-04-08T00:00:00.000Z'),
          dueDate: new Date('2026-04-08T00:00:00.000Z'),
          paidAt: null,
          category: { id: 11, name: 'Moradia', type: 'EXPENSE' },
          account: { id: 1, name: 'Conta principal', type: 'BANK' },
        },
      ],
      accounts: [
        {
          id: 1,
          name: 'Conta principal',
          type: 'BANK',
          initialBalance: '1000.00',
          active: true,
        },
      ],
    })
  })

  it('keeps the dashboard read model fresh after a paid transaction mutation and invalidates dashboard pages', async () => {
    const beforeResponse = await getDashboard(
      new NextRequest('http://localhost/api/dashboard?month=2026-04'),
    )
    const beforePayload = await beforeResponse.json()

    expect(beforePayload.summary.realizedExpense).toBe('0.00')

    const mutationResponse = await patchTransaction(
      new Request('http://localhost/api/transactions/10', {
        method: 'PATCH',
        body: JSON.stringify({
          id: 10,
          status: 'PAID',
          paidAt: '2026-04-08T00:00:00.000Z',
        }),
      }) as never,
      { params: Promise.resolve({ transactionId: '10' }) },
    )

    const afterResponse = await getDashboard(
      new NextRequest('http://localhost/api/dashboard?month=2026-04'),
    )
    const afterPayload = await afterResponse.json()

    expect(mutationResponse.status).toBe(200)
    expect(afterPayload.summary.realizedExpense).toBe('125.00')
    expect(afterPayload.accounts[0]).toEqual(
      expect.objectContaining({
        id: 1,
        balance: '875.00',
      }),
    )
    expect(cacheMock.revalidatePath).toHaveBeenCalledWith('/dashboard')
    expect(cacheMock.revalidatePath).toHaveBeenCalledWith('/dashboard/transactions')
  })
})
