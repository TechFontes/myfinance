import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const goalsMock = vi.hoisted(() => ({
  recordGoalWithdrawalForUser: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/goals/service', () => goalsMock)

import { POST } from '@/api/goals/[goalId]/withdraw/route'

describe('goal withdraw api route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns unauthorized without session', async () => {
    authMock.getUserFromRequest.mockResolvedValue(null)

    const response = await POST(
      new Request('http://localhost/api/goals/1/withdraw', {
        method: 'POST',
        body: JSON.stringify({ amount: '100.00' }),
      }) as never,
      { params: Promise.resolve({ goalId: '1' }) },
    )

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
  })

  it('records a withdrawal and returns 201', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    goalsMock.recordGoalWithdrawalForUser.mockResolvedValue({
      id: 10,
      goalId: 5,
      kind: 'WITHDRAWAL',
      amount: '-200.00',
      transferId: null,
    })

    const response = await POST(
      new Request('http://localhost/api/goals/5/withdraw', {
        method: 'POST',
        body: JSON.stringify({ amount: '200.00' }),
      }) as never,
      { params: Promise.resolve({ goalId: '5' }) },
    )
    const payload = await response.json()

    expect(response.status).toBe(201)
    expect(goalsMock.recordGoalWithdrawalForUser).toHaveBeenCalledWith('user-1', 5, {
      amount: '200.00',
      transferId: undefined,
    })
    expect(payload).toEqual({
      id: 10,
      goalId: 5,
      kind: 'WITHDRAWAL',
      amount: '-200.00',
      transferId: null,
    })
  })

  it('returns 404 when goal not found', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    goalsMock.recordGoalWithdrawalForUser.mockResolvedValue(null)

    const response = await POST(
      new Request('http://localhost/api/goals/999/withdraw', {
        method: 'POST',
        body: JSON.stringify({ amount: '100.00' }),
      }) as never,
      { params: Promise.resolve({ goalId: '999' }) },
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'Not found' })
  })

  it('returns 400 when amount is missing', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })

    const response = await POST(
      new Request('http://localhost/api/goals/5/withdraw', {
        method: 'POST',
        body: JSON.stringify({}),
      }) as never,
      { params: Promise.resolve({ goalId: '5' }) },
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'amount is required and must be positive' })
  })

  it('returns 400 when amount is zero', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })

    const response = await POST(
      new Request('http://localhost/api/goals/5/withdraw', {
        method: 'POST',
        body: JSON.stringify({ amount: '0' }),
      }) as never,
      { params: Promise.resolve({ goalId: '5' }) },
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'amount is required and must be positive' })
  })

  it('returns 400 for domain errors', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    const domainError = Object.assign(new Error('Cannot withdraw from goal with status COMPLETED'), { code: 'GOAL_WITHDRAWAL_INVALID_STATUS' })
    goalsMock.recordGoalWithdrawalForUser.mockRejectedValue(domainError)

    const response = await POST(
      new Request('http://localhost/api/goals/5/withdraw', {
        method: 'POST',
        body: JSON.stringify({ amount: '100.00' }),
      }) as never,
      { params: Promise.resolve({ goalId: '5' }) },
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Cannot withdraw from goal with status COMPLETED' })
  })
})
