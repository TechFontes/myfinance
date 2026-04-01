import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const goalsMock = vi.hoisted(() => ({
  listGoalsByUser: vi.fn(),
  createGoalForUser: vi.fn(),
  updateGoalForUser: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/goals/service', () => goalsMock)

import { GET, POST } from '@/api/goals/route'
import { PATCH } from '@/api/goals/[goalId]/route'

describe('goals api routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns unauthorized without session', async () => {
    authMock.getUserFromRequest.mockResolvedValue(null)

    const response = await GET()

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
  })

  it('lists goals for the authenticated user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    goalsMock.listGoalsByUser.mockResolvedValue([{ id: 1, name: 'Reserva' }])

    const response = await GET()
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(goalsMock.listGoalsByUser).toHaveBeenCalledWith('user-1')
    expect(payload).toEqual([{ id: 1, name: 'Reserva' }])
  })

  it('creates a goal for the authenticated user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    goalsMock.createGoalForUser.mockResolvedValue({ id: 10, name: 'Aposentadoria' })

    const response = await POST(
      new Request('http://localhost/api/goals', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Aposentadoria',
          targetAmount: '50000.00',
          reserveAccountId: 7,
          status: 'ACTIVE',
          description: 'Longo prazo',
        }),
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(201)
    expect(goalsMock.createGoalForUser).toHaveBeenCalledWith('user-1', {
      name: 'Aposentadoria',
      targetAmount: '50000.00',
      reserveAccountId: 7,
      status: 'ACTIVE',
      description: 'Longo prazo',
    })
    expect(payload).toEqual({ id: 10, name: 'Aposentadoria' })
  })

  it('updates a goal by id for the authenticated user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    goalsMock.updateGoalForUser.mockResolvedValue({ id: 9, name: 'Meta ajustada' })

    const response = await PATCH(
      new Request('http://localhost/api/goals/9', {
        method: 'PATCH',
        body: JSON.stringify({
          id: 9,
          name: 'Meta ajustada',
          status: 'COMPLETED',
          editScope: 'THIS_GOAL',
        }),
      }) as never,
      { params: Promise.resolve({ goalId: '9' }) },
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(goalsMock.updateGoalForUser).toHaveBeenCalledWith('user-1', 9, {
      id: 9,
      name: 'Meta ajustada',
      status: 'COMPLETED',
      editScope: 'THIS_GOAL',
    })
    expect(payload).toEqual({ id: 9, name: 'Meta ajustada' })
  })

  it('returns not found when the goal does not exist', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    goalsMock.updateGoalForUser.mockResolvedValue(null)

    const response = await PATCH(
      new Request('http://localhost/api/goals/999', {
        method: 'PATCH',
        body: JSON.stringify({
          id: 999,
          name: 'Missing',
        }),
      }) as never,
      { params: Promise.resolve({ goalId: '999' }) },
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'Not found' })
  })
})
