import { prisma } from '@/lib/prisma'
import type {
  GoalContributionInput,
  GoalCreateInput,
  GoalRecord,
  GoalUpdateInput,
} from './contracts'

type GoalContributionWithTransferInput = GoalContributionInput & {
  transferId?: number | null
}

type GoalContributionRecord = {
  id: number
  goalId: number
  transferId: number | null
  amount: { toString(): string }
  reflectFinancially: boolean
  createdAt: Date
  updatedAt: Date
}

type GoalWithContributions = {
  id: number
  userId: string
  name: string
  targetAmount: { toString(): string }
  reserveAccountId: number | null
  status: GoalRecord['status']
  createdAt: Date
  updatedAt: Date
  contributions?: Array<{
    amount: { toString(): string }
  }>
}

function toCents(value: string | number | { toString(): string } | null | undefined) {
  return Math.round(Number(value ?? 0) * 100)
}

function fromCents(value: number) {
  return (value / 100).toFixed(2)
}

function resolveCurrentAmount(contributions: GoalWithContributions['contributions']) {
  const safeContributions = contributions ?? []

  const total = safeContributions.reduce((sum, contribution) => {
    return sum + toCents(contribution.amount)
  }, 0)

  return fromCents(total)
}

function mapGoal(goal: GoalWithContributions): GoalRecord {
  const contributions = goal.contributions ?? []

  return {
    id: goal.id,
    userId: goal.userId,
    name: goal.name,
    targetAmount: goal.targetAmount.toString(),
    currentAmount: resolveCurrentAmount(contributions),
    reserveAccountId: goal.reserveAccountId,
    status: goal.status,
    description: null,
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
  }
}

export async function listGoalsByUser(userId: string): Promise<GoalRecord[]> {
  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    include: {
      contributions: {
        select: { amount: true },
      },
    },
  })

  return goals.map((goal: unknown) => mapGoal(goal as GoalWithContributions))
}

export async function createGoalForUser(
  userId: string,
  input: GoalCreateInput,
): Promise<GoalRecord> {
  const goal = await prisma.goal.create({
    data: {
      userId,
      name: input.name,
      targetAmount: input.targetAmount,
      reserveAccountId: input.reserveAccountId ?? null,
      status: input.status ?? 'ACTIVE',
    },
    include: {
      contributions: {
        select: { amount: true },
      },
    },
  })

  return mapGoal(goal as GoalWithContributions)
}

export async function updateGoalForUser(
  userId: string,
  goalId: number,
  input: GoalUpdateInput,
): Promise<GoalRecord | null> {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
  })

  if (!goal) {
    return null
  }

  const data: {
    name?: string
    targetAmount?: string
    reserveAccountId?: number | null
    status?: GoalRecord['status']
  } = {}

  if (input.name !== undefined) {
    data.name = input.name
  }

  if (input.targetAmount !== undefined) {
    data.targetAmount = input.targetAmount
  }

  if (input.reserveAccountId !== undefined) {
    data.reserveAccountId = input.reserveAccountId
  }

  if (input.status !== undefined) {
    data.status = input.status
  }

  const updatedGoal = await prisma.goal.update({
    where: { id: goalId },
    data,
    include: {
      contributions: {
        select: { amount: true },
      },
    },
  })

  return mapGoal(updatedGoal as GoalWithContributions)
}

export async function recordGoalContributionForUser(
  userId: string,
  input: GoalContributionWithTransferInput,
): Promise<GoalContributionRecord | null> {
  const goal = await prisma.goal.findFirst({
    where: { id: input.goalId, userId },
  })

  if (!goal) {
    return null
  }

  return prisma.goalContribution.create({
    data: {
      goalId: input.goalId,
      amount: input.amount,
      reflectFinancially: input.mode === 'TRANSFER_TO_RESERVE',
      transferId: input.mode === 'TRANSFER_TO_RESERVE' ? input.transferId ?? null : null,
    },
  })
}
