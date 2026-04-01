import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const recurrenceMock = vi.hoisted(() => ({
  listRecurringRulesByUser: vi.fn(),
  createRecurringRuleForUser: vi.fn(),
  updateRecurringRuleForUser: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/recurrence/service', () => recurrenceMock)

import { GET, POST } from '@/api/recurrence/route'
import { PATCH } from '@/api/recurrence/[ruleId]/route'

describe('recurrence api routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns unauthorized for requests without session', async () => {
    authMock.getUserFromRequest.mockResolvedValue(null)

    const response = await GET()

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
  })

  it('lists recurring rules for the authenticated user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    recurrenceMock.listRecurringRulesByUser.mockResolvedValue([{ id: 1, description: 'Aluguel' }])

    const response = await GET()
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(recurrenceMock.listRecurringRulesByUser).toHaveBeenCalledWith('user-1')
    expect(payload).toEqual([{ id: 1, description: 'Aluguel' }])
  })

  it('creates a recurring rule for the authenticated user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    recurrenceMock.createRecurringRuleForUser.mockResolvedValue({ id: 10, description: 'Internet' })

    const response = await POST(
      new Request('http://localhost/api/recurrence', {
        method: 'POST',
        body: JSON.stringify({
          type: 'EXPENSE',
          description: 'Internet',
          value: '129.90',
          categoryId: 12,
          frequency: 'MONTHLY',
          dayOfMonth: 5,
          startDate: '2026-03-01T00:00:00.000Z',
        }),
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(201)
    expect(recurrenceMock.createRecurringRuleForUser).toHaveBeenCalledWith('user-1', {
      type: 'EXPENSE',
      description: 'Internet',
      value: '129.90',
      categoryId: 12,
      accountId: null,
      creditCardId: null,
      frequency: 'MONTHLY',
      dayOfMonth: 5,
      startDate: new Date('2026-03-01T00:00:00.000Z'),
      endDate: null,
      active: true,
    })
    expect(payload).toEqual({ id: 10, description: 'Internet' })
  })

  it('updates a recurring rule by id for the authenticated user and preserves edit scope', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    recurrenceMock.updateRecurringRuleForUser.mockResolvedValue({ id: 10, description: 'Internet ajustada' })

    const response = await PATCH(
      new Request('http://localhost/api/recurrence/10', {
        method: 'PATCH',
        body: JSON.stringify({
          id: 10,
          description: 'Internet ajustada',
          editScope: 'THIS_AND_FUTURE',
        }),
      }) as never,
      { params: Promise.resolve({ ruleId: '10' }) },
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(recurrenceMock.updateRecurringRuleForUser).toHaveBeenCalledWith('user-1', 10, {
      id: 10,
      description: 'Internet ajustada',
      editScope: 'THIS_AND_FUTURE',
    })
    expect(payload).toEqual({ id: 10, description: 'Internet ajustada' })
  })

  it('returns not found when updating a missing recurring rule', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    recurrenceMock.updateRecurringRuleForUser.mockResolvedValue(null)

    const response = await PATCH(
      new Request('http://localhost/api/recurrence/999', {
        method: 'PATCH',
        body: JSON.stringify({
          id: 999,
          description: 'Missing',
        }),
      }) as never,
      { params: Promise.resolve({ ruleId: '999' }) },
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'Not found' })
  })
})
