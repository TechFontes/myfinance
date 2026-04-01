import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const transfersMock = vi.hoisted(() => ({
  listTransfersByUser: vi.fn(),
  createTransferForUser: vi.fn(),
  updateTransferForUser: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/transfers/service', () => transfersMock)

import { GET, POST } from '@/api/transfers/route'
import { PATCH } from '@/api/transfers/[transferId]/route'

describe('transfers api routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists transfers for the authenticated user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transfersMock.listTransfersByUser.mockResolvedValue([{ id: 1, description: 'Entre contas' }])

    const response = await GET()
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual([{ id: 1, description: 'Entre contas' }])
  })

  it('returns unauthorized when the user is not authenticated', async () => {
    authMock.getUserFromRequest.mockResolvedValue(null)

    const response = await GET()
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload).toEqual({ error: 'Unauthorized' })
  })

  it('creates a transfer for the authenticated user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transfersMock.createTransferForUser.mockResolvedValue({ id: 10, description: 'Reserva' })

    const response = await POST(
      new Request('http://localhost/api/transfers', {
        method: 'POST',
        body: JSON.stringify({
          sourceAccountId: 1,
          destinationAccountId: 2,
          amount: '150.00',
          description: 'Reserva',
          competenceDate: '2026-03-31',
          dueDate: '2026-04-01',
        }),
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(201)
    expect(transfersMock.createTransferForUser).toHaveBeenCalledWith('user-1', {
      sourceAccountId: 1,
      destinationAccountId: 2,
      amount: '150.00',
      description: 'Reserva',
      competenceDate: '2026-03-31',
      dueDate: '2026-04-01',
    })
    expect(payload).toEqual({ id: 10, description: 'Reserva' })
  })

  it('returns bad request when trying to create a transfer between the same account', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    const error = new Error('Transfer source and destination accounts must be different') as Error & {
      code: string
    }
    error.code = 'TRANSFER_SAME_ACCOUNT'
    transfersMock.createTransferForUser.mockRejectedValue(error)

    const response = await POST(
      new Request('http://localhost/api/transfers', {
        method: 'POST',
        body: JSON.stringify({
          sourceAccountId: 1,
          destinationAccountId: 1,
          amount: '150.00',
          description: 'Reserva',
          competenceDate: '2026-03-31',
          dueDate: '2026-04-01',
        }),
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload).toEqual({ error: 'Transfer source and destination accounts must be different' })
  })

  it('updates a transfer for the authenticated user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transfersMock.updateTransferForUser.mockResolvedValue({ id: 10, description: 'Reserva ajustada' })

    const response = await PATCH(
      new Request('http://localhost/api/transfers/10', {
        method: 'PATCH',
        body: JSON.stringify({ description: 'Reserva ajustada' }),
      }) as never,
      { params: Promise.resolve({ transferId: '10' }) },
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(transfersMock.updateTransferForUser).toHaveBeenCalledWith('user-1', 10, {
      description: 'Reserva ajustada',
    })
    expect(payload).toEqual({ id: 10, description: 'Reserva ajustada' })
  })

  it('returns not found when the transfer does not belong to the authenticated user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    transfersMock.updateTransferForUser.mockResolvedValue(null)

    const response = await PATCH(
      new Request('http://localhost/api/transfers/10', {
        method: 'PATCH',
        body: JSON.stringify({ description: 'Reserva ajustada' }),
      }) as never,
      { params: Promise.resolve({ transferId: '10' }) },
    )
    const payload = await response.json()

    expect(response.status).toBe(404)
    expect(payload).toEqual({ error: 'Not found' })
  })
})
