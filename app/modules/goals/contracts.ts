export const goalStatuses = ['ACTIVE', 'COMPLETED', 'CANCELED'] as const

export const goalContributionModes = [
  'INFORMATION_ONLY',
  'TRANSFER_TO_RESERVE',
] as const

export const goalsEditScopes = ['THIS_GOAL', 'THIS_AND_FUTURE'] as const

export type GoalStatus = (typeof goalStatuses)[number]
export type GoalContributionMode = (typeof goalContributionModes)[number]
export type GoalEditScope = (typeof goalsEditScopes)[number]

export type GoalRecord = {
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
}

export type GoalCreateInput = {
  name: string
  targetAmount: string
  reserveAccountId?: number | null
  status?: GoalStatus
  description?: string | null
}

export type GoalUpdateInput = Partial<GoalCreateInput> & {
  editScope?: GoalEditScope
}

export type GoalContributionInput = {
  goalId: number
  amount: string
  mode?: GoalContributionMode
  note?: string | null
}
