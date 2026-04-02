import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const transactionsMock = vi.hoisted(() => ({
  updateTransactionByUser: vi.fn(),
}))

const cacheMock = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/transactions/service', () => transactionsMock)
vi.mock('next/cache', () => cacheMock)

import { PATCH as patchTransaction } from '@/api/transactions/[transactionId]/route'

describe('dashboard freshness regression', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transactionsMock.updateTransactionByUser.mockResolvedValue({
      id: 10,
      status: 'PAID',
    })
  })

  it('invalidates dashboard reads after a paid transaction mutation', async () => {
    const response = await patchTransaction(
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

    expect(response.status).toBe(200)
    expect(transactionsMock.updateTransactionByUser).toHaveBeenCalledWith(
      'user-1',
      10,
      expect.objectContaining({
        status: 'PAID',
        paidAt: new Date('2026-04-08T00:00:00.000Z'),
      }),
    )
    expect(cacheMock.revalidatePath).toHaveBeenCalledWith('/dashboard')
  })
})
