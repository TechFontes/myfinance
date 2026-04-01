import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const goalsMock = vi.hoisted(() => ({
  recordGoalContributionForUser: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/goals/service', () => goalsMock)

import { POST } from '@/api/goals/[goalId]/contributions/route'

describe('goal contributions api route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns unauthorized without session', async () => {
    authMock.getUserFromRequest.mockResolvedValue(null)

    const response = await POST(
      new Request('http://localhost/api/goals/1/contributions', {
        method: 'POST',
        body: JSON.stringify({ amount: '100.00' }),
      }) as never,
      { params: Promise.resolve({ goalId: '1' }) },
    )

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
  })

  it('records a contribution for the authenticated user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    goalsMock.recordGoalContributionForUser.mockResolvedValue({
      id: 22,
      goalId: 1,
      transferId: null,
      amount: '100.00',
      reflectFinancially: false,
    })

    const response = await POST(
      new Request('http://localhost/api/goals/1/contributions', {
        method: 'POST',
        body: JSON.stringify({
          goalId: 1,
          amount: '100.00',
          mode: 'INFORMATION_ONLY',
          note: 'aporte mensal',
        }),
      }) as never,
      { params: Promise.resolve({ goalId: '1' }) },
    )
    const payload = await response.json()

    expect(response.status).toBe(201)
    expect(goalsMock.recordGoalContributionForUser).toHaveBeenCalledWith('user-1', {
      goalId: 1,
      amount: '100.00',
      mode: 'INFORMATION_ONLY',
      note: 'aporte mensal',
    })
    expect(payload).toEqual({
      id: 22,
      goalId: 1,
      transferId: null,
      amount: '100.00',
      reflectFinancially: false,
    })
  })

  it('returns not found when the goal does not exist', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    goalsMock.recordGoalContributionForUser.mockResolvedValue(null)

    const response = await POST(
      new Request('http://localhost/api/goals/999/contributions', {
        method: 'POST',
        body: JSON.stringify({
          goalId: 999,
          amount: '100.00',
        }),
      }) as never,
      { params: Promise.resolve({ goalId: '999' }) },
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'Not found' })
  })
})
