import { describe, it, expect, vi, beforeEach } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  goal: { findFirst: vi.fn() },
  goalContribution: { create: vi.fn() },
}))
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/modules/financial-core/invariants', () => ({
  assertUserOwnsAccount: vi.fn(),
}))

import { recordGoalWithdrawalForUser } from '@/modules/goals/service'

describe('recordGoalWithdrawalForUser', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates withdrawal contribution for active goal', async () => {
    prismaMock.goal.findFirst.mockResolvedValue({ id: 5, userId: 'user-1', status: 'ACTIVE', reserveAccountId: null })
    prismaMock.goalContribution.create.mockResolvedValue({ id: 1, goalId: 5, kind: 'WITHDRAWAL', amount: { toNumber: () => -200 } })

    const result = await recordGoalWithdrawalForUser('user-1', 5, { amount: '200.00' })
    expect(result).not.toBeNull()
    expect(prismaMock.goalContribution.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ goalId: 5, kind: 'WITHDRAWAL' }),
    })
  })

  it('stores negative amount for withdrawal', async () => {
    prismaMock.goal.findFirst.mockResolvedValue({ id: 5, userId: 'user-1', status: 'ACTIVE' })
    prismaMock.goalContribution.create.mockResolvedValue({ id: 1 })

    await recordGoalWithdrawalForUser('user-1', 5, { amount: '200.00' })
    const createCall = prismaMock.goalContribution.create.mock.calls[0][0]
    expect(Number(createCall.data.amount)).toBeLessThan(0)
  })

  it('rejects withdrawal from non-ACTIVE goal', async () => {
    prismaMock.goal.findFirst.mockResolvedValue({ id: 5, userId: 'user-1', status: 'COMPLETED' })
    await expect(recordGoalWithdrawalForUser('user-1', 5, { amount: '200.00' })).rejects.toThrow()
  })

  it('rejects zero amount', async () => {
    prismaMock.goal.findFirst.mockResolvedValue({ id: 5, userId: 'user-1', status: 'ACTIVE' })
    await expect(recordGoalWithdrawalForUser('user-1', 5, { amount: '0' })).rejects.toThrow()
  })

  it('returns null when goal not found', async () => {
    prismaMock.goal.findFirst.mockResolvedValue(null)
    const result = await recordGoalWithdrawalForUser('user-1', 999, { amount: '100' })
    expect(result).toBeNull()
  })
})
