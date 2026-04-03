import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const accountsMock = vi.hoisted(() => ({
  listAccountsByUser: vi.fn(),
  createAccountForUser: vi.fn(),
}))

const transactionsMock = vi.hoisted(() => ({
  listTransactionsByUser: vi.fn(),
  countTransactionsByUser: vi.fn(),
  createTransactionForUser: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/accounts/service', () => accountsMock)
vi.mock('@/modules/transactions/service', () => transactionsMock)

import { POST as accountsPost } from '@/api/accounts/route'
import { POST as transactionsPost } from '@/api/transactions/route'

describe('validation consistency – invalid payloads return 400', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
  })

  it('POST /api/accounts returns 400 for invalid body', async () => {
    const response = await accountsPost(
      new Request('http://localhost/api/accounts', {
        method: 'POST',
        body: JSON.stringify({ invalid: true }),
      }) as never,
    )

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toHaveProperty('error')
    expect(accountsMock.createAccountForUser).not.toHaveBeenCalled()
  })

  it('POST /api/transactions returns 400 for invalid body', async () => {
    const response = await transactionsPost(
      new Request('http://localhost/api/transactions', {
        method: 'POST',
        body: JSON.stringify({ invalid: true }),
      }) as never,
    )

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toHaveProperty('error')
    expect(transactionsMock.createTransactionForUser).not.toHaveBeenCalled()
  })
})
