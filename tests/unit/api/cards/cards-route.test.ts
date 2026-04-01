import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const cardsMock = vi.hoisted(() => ({
  listCardsByUser: vi.fn(),
  createCardForUser: vi.fn(),
  updateCardForUser: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/cards/service', () => cardsMock)

import { GET, POST } from '@/api/cards/route'
import { PATCH } from '@/api/cards/[cardId]/route'

describe('cards api routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns unauthorized for requests without session', async () => {
    authMock.getUserFromRequest.mockResolvedValue(null)

    const response = await GET(new Request('http://localhost/api/cards') as never)

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
  })

  it('lists cards for the authenticated user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    cardsMock.listCardsByUser.mockResolvedValue([{ id: 1, name: 'Nubank' }])

    const response = await GET(new Request('http://localhost/api/cards') as never)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(cardsMock.listCardsByUser).toHaveBeenCalledWith('user-1')
    expect(payload).toEqual([{ id: 1, name: 'Nubank' }])
  })

  it('creates a card for the authenticated user with close and due days', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    cardsMock.createCardForUser.mockResolvedValue({ id: 10, name: 'Nubank' })

    const response = await POST(
      new Request('http://localhost/api/cards', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Nubank',
          limit: '5000.00',
          closeDay: 10,
          dueDay: 15,
          color: '#111111',
          icon: 'card',
        }),
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(201)
    expect(cardsMock.createCardForUser).toHaveBeenCalledWith('user-1', {
      name: 'Nubank',
      limit: '5000.00',
      closeDay: 10,
      dueDay: 15,
      color: '#111111',
      icon: 'card',
      active: true,
    })
    expect(payload).toEqual({ id: 10, name: 'Nubank' })
  })

  it('updates a card by id for the authenticated user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    cardsMock.updateCardForUser.mockResolvedValue({ id: 10, name: 'Cartão atualizado' })

    const response = await PATCH(
      new Request('http://localhost/api/cards/10', {
        method: 'PATCH',
        body: JSON.stringify({
          id: 10,
          name: 'Cartão atualizado',
          closeDay: 12,
          dueDay: 20,
        }),
      }) as never,
      { params: { cardId: '10' } },
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(cardsMock.updateCardForUser).toHaveBeenCalledWith('user-1', 10, {
      id: 10,
      name: 'Cartão atualizado',
      closeDay: 12,
      dueDay: 20,
    })
    expect(payload).toEqual({ id: 10, name: 'Cartão atualizado' })
  })

  it('returns not found when updating a missing card', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    cardsMock.updateCardForUser.mockResolvedValue(null)

    const response = await PATCH(
      new Request('http://localhost/api/cards/999', {
        method: 'PATCH',
        body: JSON.stringify({
          id: 999,
          name: 'Missing',
        }),
      }) as never,
      { params: { cardId: '999' } },
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'Not found' })
  })
})
