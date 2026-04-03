import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const transactionsMock = vi.hoisted(() => ({
  settleTransactionForUser: vi.fn(),
  cancelTransactionForUser: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/transactions/service', () => transactionsMock)
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { PATCH as SettlePATCH } from '@/api/transactions/[transactionId]/settle/route'
import { PATCH as CancelPATCH } from '@/api/transactions/[transactionId]/cancel/route'

describe('settle route', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns unauthorized without session', async () => {
    authMock.getUserFromRequest.mockResolvedValue(null)

    const response = await SettlePATCH(
      new Request('http://localhost/api/transactions/10/settle', {
        method: 'PATCH',
        body: JSON.stringify({ accountId: 1, paidAt: '2026-04-02T00:00:00.000Z' }),
      }) as never,
      { params: Promise.resolve({ transactionId: '10' }) },
    )

    expect(response.status).toBe(401)
  })

  it('settles a transaction and returns 200', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transactionsMock.settleTransactionForUser.mockResolvedValue({ id: 10, status: 'PAID' })

    const response = await SettlePATCH(
      new Request('http://localhost/api/transactions/10/settle', {
        method: 'PATCH',
        body: JSON.stringify({ accountId: 1, paidAt: '2026-04-02T00:00:00.000Z' }),
      }) as never,
      { params: Promise.resolve({ transactionId: '10' }) },
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({ id: 10, status: 'PAID' })
    expect(transactionsMock.settleTransactionForUser).toHaveBeenCalledWith(
      'user-1',
      10,
      { accountId: 1, paidAt: new Date('2026-04-02T00:00:00.000Z') },
    )
  })

  it('returns 404 when transaction not found', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transactionsMock.settleTransactionForUser.mockResolvedValue(null)

    const response = await SettlePATCH(
      new Request('http://localhost/api/transactions/999/settle', {
        method: 'PATCH',
        body: JSON.stringify({ accountId: 1, paidAt: '2026-04-02T00:00:00.000Z' }),
      }) as never,
      { params: Promise.resolve({ transactionId: '999' }) },
    )

    expect(response.status).toBe(404)
  })

  it('returns 400 for invalid transaction id', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })

    const response = await SettlePATCH(
      new Request('http://localhost/api/transactions/abc/settle', {
        method: 'PATCH',
        body: JSON.stringify({ accountId: 1, paidAt: '2026-04-02T00:00:00.000Z' }),
      }) as never,
      { params: Promise.resolve({ transactionId: 'abc' }) },
    )

    expect(response.status).toBe(400)
  })

  it('returns 400 when service throws domain error', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transactionsMock.settleTransactionForUser.mockRejectedValue(new Error('Cannot settle'))

    const response = await SettlePATCH(
      new Request('http://localhost/api/transactions/10/settle', {
        method: 'PATCH',
        body: JSON.stringify({ accountId: 1, paidAt: '2026-04-02T00:00:00.000Z' }),
      }) as never,
      { params: Promise.resolve({ transactionId: '10' }) },
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Cannot settle' })
  })
})

describe('cancel route', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns unauthorized without session', async () => {
    authMock.getUserFromRequest.mockResolvedValue(null)

    const response = await CancelPATCH(
      new Request('http://localhost/api/transactions/10/cancel', { method: 'PATCH' }) as never,
      { params: Promise.resolve({ transactionId: '10' }) },
    )

    expect(response.status).toBe(401)
  })

  it('cancels a transaction and returns 200', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transactionsMock.cancelTransactionForUser.mockResolvedValue({ id: 10, status: 'CANCELED' })

    const response = await CancelPATCH(
      new Request('http://localhost/api/transactions/10/cancel', { method: 'PATCH' }) as never,
      { params: Promise.resolve({ transactionId: '10' }) },
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({ id: 10, status: 'CANCELED' })
    expect(transactionsMock.cancelTransactionForUser).toHaveBeenCalledWith('user-1', 10)
  })

  it('returns 404 when transaction not found', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transactionsMock.cancelTransactionForUser.mockResolvedValue(null)

    const response = await CancelPATCH(
      new Request('http://localhost/api/transactions/999/cancel', { method: 'PATCH' }) as never,
      { params: Promise.resolve({ transactionId: '999' }) },
    )

    expect(response.status).toBe(404)
  })

  it('returns 400 for invalid transaction id', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })

    const response = await CancelPATCH(
      new Request('http://localhost/api/transactions/abc/cancel', { method: 'PATCH' }) as never,
      { params: Promise.resolve({ transactionId: 'abc' }) },
    )

    expect(response.status).toBe(400)
  })

  it('returns 400 when service throws domain error', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transactionsMock.cancelTransactionForUser.mockRejectedValue(new Error('Already canceled'))

    const response = await CancelPATCH(
      new Request('http://localhost/api/transactions/10/cancel', { method: 'PATCH' }) as never,
      { params: Promise.resolve({ transactionId: '10' }) },
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Already canceled' })
  })
})
