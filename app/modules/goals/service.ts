import type { Goal, GoalContribution, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type {
  GoalContributionInput,
  GoalCreateInput,
  GoalRecord,
  GoalUpdateInput,
} from './contracts'

type GoalWithContributions = Goal & {
  contributions: Array<{
    amount: string
  }>
}

type GoalContributionWithTransferInput = GoalContributionInput & {
  transferId?: number | null
}

function toCents(value: string | number | null | undefined) {
  return Math.round(Number(value ?? 0) * 100)
}

function fromCents(value: number) {
  return (value / 100).toFixed(2)
}

function resolveCurrentAmount(contributions: GoalWithContributions['contributions']) {
  const total = contributions.reduce((sum, contribution) => {
    return sum + toCents(contribution.amount)
  }, 0)

  return fromCents(total)
}

function mapGoal(goal: GoalWithContributions): GoalRecord {
  return {
    id: goal.id,
    userId: goal.userId,
    name: goal.name,
    targetAmount: goal.targetAmount.toString(),
    currentAmount: resolveCurrentAmount(goal.contributions),
    reserveAccountId: goal.reserveAccountId,
    status: goal.status,
    description: goal.description,
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
  }
}

export async function listGoalsByUser(userId: string): Promise<GoalRecord[]> {
  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: [{ createdAt: 'desc' }],
    include: {
      contributions: {
        select: { amount: true },
      },
    },
  })

  return goals.map((goal) => mapGoal(goal as GoalWithContributions))
}

export async function createGoalForUser(
  userId: string,
  input: GoalCreateInput,
): Promise<Goal> {
  return prisma.goal.create({
    data: {
      userId,
      name: input.name,
      targetAmount: input.targetAmount,
      reserveAccountId: input.reserveAccountId ?? null,
      status: input.status ?? 'ACTIVE',
      description: input.description ?? null,
    },
  })
}

export async function updateGoalForUser(
  userId: string,
  goalId: number,
  input: GoalUpdateInput,
): Promise<Goal | null> {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
  })

  if (!goal) {
    return null
  }

  const data: Prisma.GoalUpdateInput = {}

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

  if (input.description !== undefined) {
    data.description = input.description
  }

  return prisma.goal.update({
    where: { id: goalId },
    data,
  })
}

export async function recordGoalContributionForUser(
  userId: string,
  input: GoalContributionWithTransferInput,
): Promise<GoalContribution | null> {
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
      transferId:
        input.mode === 'TRANSFER_TO_RESERVE' ? input.transferId ?? null : null,
    },
  })
}
