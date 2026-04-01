import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const transactionsMock = vi.hoisted(() => ({
  listTransactionsByUser: vi.fn(),
  countTransactionsByUser: vi.fn(),
  createTransactionForUser: vi.fn(),
  updateTransactionByUser: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/transactions/service', () => transactionsMock)

import { GET, POST } from '@/api/transactions/route'
import { PATCH } from '@/api/transactions/[transactionId]/route'

describe('transactions api routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns unauthorized for private requests without session', async () => {
    authMock.getUserFromRequest.mockResolvedValue(null)

    const response = await GET(new Request('http://localhost/api/transactions') as never)

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
  })

  it('lists transactions for the authenticated user with filters and pagination', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transactionsMock.listTransactionsByUser.mockResolvedValue([{ id: 1, description: 'Internet' }])
    transactionsMock.countTransactionsByUser.mockResolvedValue(1)

    const response = await GET(
      new Request(
        'http://localhost/api/transactions?search=internet&type=EXPENSE&status=PENDING&categoryId=12&page=2&pageSize=25',
      ) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(transactionsMock.listTransactionsByUser).toHaveBeenCalledWith('user-1', {
      search: 'internet',
      type: 'EXPENSE',
      status: 'PENDING',
      categoryId: 12,
      page: 2,
      pageSize: 25,
    })
    expect(transactionsMock.countTransactionsByUser).toHaveBeenCalledWith('user-1', {
      search: 'internet',
      type: 'EXPENSE',
      status: 'PENDING',
      categoryId: 12,
      page: 2,
      pageSize: 25,
    })
    expect(payload).toEqual({
      items: [{ id: 1, description: 'Internet' }],
      total: 1,
      page: 2,
      pageSize: 25,
    })
  })

  it('creates a transaction for the authenticated user with the new schema', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transactionsMock.createTransactionForUser.mockResolvedValue({ id: 10, description: 'Internet' })

    const response = await POST(
      new Request('http://localhost/api/transactions', {
        method: 'POST',
        body: JSON.stringify({
          type: 'EXPENSE',
          description: 'Internet',
          value: '129.90',
          categoryId: 12,
          competenceDate: '2026-03-01T00:00:00.000Z',
          dueDate: '2026-03-10T00:00:00.000Z',
        }),
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(201)
    expect(transactionsMock.createTransactionForUser).toHaveBeenCalledWith('user-1', {
      type: 'EXPENSE',
      description: 'Internet',
      value: '129.90',
      categoryId: 12,
      accountId: null,
      creditCardId: null,
      invoiceId: null,
      competenceDate: new Date('2026-03-01T00:00:00.000Z'),
      dueDate: new Date('2026-03-10T00:00:00.000Z'),
      paidAt: null,
      status: 'PLANNED',
      fixed: false,
      installment: null,
      installments: null,
    })
    expect(payload).toEqual({ id: 10, description: 'Internet' })
  })

  it('updates a transaction by id for the authenticated user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transactionsMock.updateTransactionByUser.mockResolvedValue({ id: 10, description: 'Internet atualizado' })

    const response = await PATCH(
      new Request('http://localhost/api/transactions/10', {
        method: 'PATCH',
        body: JSON.stringify({
          id: 10,
          description: 'Internet atualizado',
          status: 'PENDING',
        }),
      }) as never,
      { params: { transactionId: '10' } },
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(transactionsMock.updateTransactionByUser).toHaveBeenCalledWith('user-1', 10, {
      id: 10,
      description: 'Internet atualizado',
      status: 'PENDING',
    })
    expect(payload).toEqual({ id: 10, description: 'Internet atualizado' })
  })

  it('returns not found when updating a missing transaction', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transactionsMock.updateTransactionByUser.mockResolvedValue(null)

    const response = await PATCH(
      new Request('http://localhost/api/transactions/999', {
        method: 'PATCH',
        body: JSON.stringify({
          id: 999,
          description: 'Missing',
        }),
      }) as never,
      { params: { transactionId: '999' } },
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'Not found' })
  })
})
