import { describe, expectTypeOf, it } from 'vitest'
import type {
  GoalContributionInput,
  GoalContributionMode,
  GoalCreateInput,
  GoalRecord,
  GoalStatus,
  GoalUpdateInput,
} from '@/modules/goals'

describe('goals module types', () => {
  it('exports the expected goal contract shapes', () => {
    expectTypeOf<GoalStatus>().toEqualTypeOf<
      'ACTIVE' | 'COMPLETED' | 'CANCELED'
    >()
    expectTypeOf<GoalContributionMode>().toEqualTypeOf<
      'INFORMATION_ONLY' | 'TRANSFER_TO_RESERVE'
    >()

    expectTypeOf<GoalCreateInput>().toMatchTypeOf<{
      name: string
      targetAmount: string
      reserveAccountId?: number | null
      status?: GoalStatus
      description?: string | null
    }>()

    expectTypeOf<GoalUpdateInput>().toMatchTypeOf<{
      name?: string
      targetAmount?: string
      reserveAccountId?: number | null
      status?: GoalStatus
      description?: string | null
      editScope?: 'THIS_GOAL' | 'THIS_AND_FUTURE'
    }>()

    expectTypeOf<GoalContributionInput>().toMatchTypeOf<{
      goalId: number
      amount: string
      mode?: GoalContributionMode
      note?: string | null
    }>()
  })

  it('exports the expected persisted record shape', () => {
    expectTypeOf<GoalRecord>().toMatchTypeOf<{
      id: number
      userId: string
      name: string
      targetAmount: string
      currentAmount: string
      reserveAccountId: number | null
      status: GoalStatus
      description: string | null
      createdAt: Date
      updatedAt: Date
    }>()
  })
})
