import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const transfersMock = vi.hoisted(() => ({
  settleTransferForUser: vi.fn(),
  cancelTransferForUser: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/transfers/service', () => transfersMock)

import { PATCH as settlePATCH } from '@/api/transfers/[transferId]/settle/route'
import { PATCH as cancelPATCH } from '@/api/transfers/[transferId]/cancel/route'

describe('settle transfer route', () => {
  beforeEach(() => vi.clearAllMocks())

  it('settles a transfer and returns 200', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transfersMock.settleTransferForUser.mockResolvedValue({ id: 5, status: 'PAID', paidAt: '2026-04-02' })

    const response = await settlePATCH(
      new Request('http://localhost/api/transfers/5/settle', {
        method: 'PATCH',
        body: JSON.stringify({ paidAt: '2026-04-02' }),
      }) as never,
      { params: Promise.resolve({ transferId: '5' }) },
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({ id: 5, status: 'PAID', paidAt: '2026-04-02' })
    expect(transfersMock.settleTransferForUser).toHaveBeenCalledWith(
      'user-1', 5, { paidAt: expect.any(Date) },
    )
  })

  it('returns 404 when transfer not found', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transfersMock.settleTransferForUser.mockResolvedValue(null)

    const response = await settlePATCH(
      new Request('http://localhost/api/transfers/999/settle', {
        method: 'PATCH',
        body: JSON.stringify({ paidAt: '2026-04-02' }),
      }) as never,
      { params: Promise.resolve({ transferId: '999' }) },
    )
    const payload = await response.json()

    expect(response.status).toBe(404)
    expect(payload).toEqual({ error: 'Transfer not found' })
  })

  it('returns 401 when not authenticated', async () => {
    authMock.getUserFromRequest.mockResolvedValue(null)

    const response = await settlePATCH(
      new Request('http://localhost/api/transfers/5/settle', {
        method: 'PATCH',
        body: JSON.stringify({ paidAt: '2026-04-02' }),
      }) as never,
      { params: Promise.resolve({ transferId: '5' }) },
    )

    expect(response.status).toBe(401)
  })

  it('returns 400 for invalid status', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transfersMock.settleTransferForUser.mockRejectedValue(
      new Error('Cannot settle transfer with status PAID'),
    )

    const response = await settlePATCH(
      new Request('http://localhost/api/transfers/5/settle', {
        method: 'PATCH',
        body: JSON.stringify({ paidAt: '2026-04-02' }),
      }) as never,
      { params: Promise.resolve({ transferId: '5' }) },
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload).toEqual({ error: 'Cannot settle transfer with status PAID' })
  })
})

describe('cancel transfer route', () => {
  beforeEach(() => vi.clearAllMocks())

  it('cancels a transfer and returns 200', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transfersMock.cancelTransferForUser.mockResolvedValue({ id: 5, status: 'CANCELED' })

    const response = await cancelPATCH(
      new Request('http://localhost/api/transfers/5/cancel', { method: 'PATCH' }) as never,
      { params: Promise.resolve({ transferId: '5' }) },
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({ id: 5, status: 'CANCELED' })
    expect(transfersMock.cancelTransferForUser).toHaveBeenCalledWith('user-1', 5)
  })

  it('returns 404 when transfer not found', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transfersMock.cancelTransferForUser.mockResolvedValue(null)

    const response = await cancelPATCH(
      new Request('http://localhost/api/transfers/999/cancel', { method: 'PATCH' }) as never,
      { params: Promise.resolve({ transferId: '999' }) },
    )
    const payload = await response.json()

    expect(response.status).toBe(404)
    expect(payload).toEqual({ error: 'Transfer not found' })
  })

  it('returns 401 when not authenticated', async () => {
    authMock.getUserFromRequest.mockResolvedValue(null)

    const response = await cancelPATCH(
      new Request('http://localhost/api/transfers/5/cancel', { method: 'PATCH' }) as never,
      { params: Promise.resolve({ transferId: '5' }) },
    )

    expect(response.status).toBe(401)
  })

  it('returns 400 when transfer already canceled', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transfersMock.cancelTransferForUser.mockRejectedValue(
      new Error('Transfer is already canceled'),
    )

    const response = await cancelPATCH(
      new Request('http://localhost/api/transfers/5/cancel', { method: 'PATCH' }) as never,
      { params: Promise.resolve({ transferId: '5' }) },
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload).toEqual({ error: 'Transfer is already canceled' })
  })
})
