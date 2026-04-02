import { prisma } from '@/lib/prisma'
import { assertUserOwnsAccount } from '@/modules/financial-core/invariants'
import type {
  GoalContributionMode,
  GoalContributionInput,
  GoalMovementKind,
  GoalCreateInput,
  GoalRecord,
  GoalUpdateInput,
} from './contracts'

type GoalContributionWithTransferInput = GoalContributionInput & {
  transferId?: number | null
}

export type GoalDomainError = Error & { code: string }

type GoalContributionRecord = {
  id: number
  goalId: number
  transferId: number | null
  amount: { toString(): string }
  kind: GoalMovementKind
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
    kind: GoalMovementKind
  }>
}

function toCents(value: string | number | { toString(): string } | null | undefined) {
  return Math.round(Number(value ?? 0) * 100)
}

function fromCents(value: number) {
  return (value / 100).toFixed(2)
}

function createGoalError(code: string, message: string): GoalDomainError {
  const error = new Error(message) as GoalDomainError
  error.code = code
  return error
}

async function assertReserveAccountOwnership(
  userId: string,
  reserveAccountId?: number | null,
) {
  if (reserveAccountId == null) {
    return
  }

  await assertUserOwnsAccount(
    userId,
    reserveAccountId,
    'GOAL_RESERVE_ACCOUNT_OWNERSHIP',
    'Goal reserve account must belong to the user',
  )
}

function resolveMovementDate(value?: string | null) {
  if (!value) {
    return new Date()
  }

  return new Date(`${value}T00:00:00.000Z`)
}

function buildGoalTransferDescription(goalName: string, mode: GoalContributionMode) {
  if (mode === 'TRANSFER_FROM_RESERVE') {
    return `Resgate da meta: ${goalName}`
  }

  return `Aporte para meta: ${goalName}`
}

function resolveGoalTransferAccounts(
  goal: { reserveAccountId: number | null },
  input: GoalContributionInput,
) {
  if (!goal.reserveAccountId) {
    throw createGoalError(
      'GOAL_RESERVE_ACCOUNT_REQUIRED',
      'Goal reserve account is required for financial movements',
    )
  }

  if (!input.counterpartAccountId) {
    throw createGoalError(
      'GOAL_COUNTERPART_ACCOUNT_REQUIRED',
      'Counterparty account is required for financial goal movements',
    )
  }

  if (input.mode === 'TRANSFER_TO_RESERVE') {
    return {
      sourceAccountId: input.counterpartAccountId,
      destinationAccountId: goal.reserveAccountId,
    }
  }

  if (input.mode === 'TRANSFER_FROM_RESERVE') {
    return {
      sourceAccountId: goal.reserveAccountId,
      destinationAccountId: input.counterpartAccountId,
    }
  }

  return null
}

export function getGoalMovementSignedAmount(movement: {
  amount: string | number | { toString(): string }
  kind: GoalMovementKind
}) {
  const normalizedAmount = fromCents(toCents(movement.amount))

  if (movement.kind === 'WITHDRAWAL') {
    return `-${normalizedAmount}`
  }

  return normalizedAmount
}

export function deriveGoalCurrentAmount(contributions: GoalWithContributions['contributions']) {
  const safeContributions = contributions ?? []

  const total = safeContributions.reduce((sum, contribution) => {
    const signal = contribution.kind === 'WITHDRAWAL' ? -1 : 1

    return sum + signal * toCents(contribution.amount)
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
    currentAmount: deriveGoalCurrentAmount(contributions),
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
        select: { amount: true, kind: true },
      },
    },
  })

  return goals.map((goal: unknown) => mapGoal(goal as GoalWithContributions))
}

export async function getGoalByUser(userId: string, goalId: number): Promise<GoalRecord | null> {
  const goal = await prisma.goal.findFirst({
    where: {
      id: goalId,
      userId,
    },
    include: {
      contributions: {
        select: { amount: true, kind: true },
      },
    },
  })

  return goal ? mapGoal(goal as unknown as GoalWithContributions) : null
}

export async function createGoalForUser(
  userId: string,
  input: GoalCreateInput,
): Promise<GoalRecord> {
  await assertReserveAccountOwnership(userId, input.reserveAccountId)

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
        select: { amount: true, kind: true },
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

  await assertReserveAccountOwnership(userId, input.reserveAccountId)

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
        select: { amount: true, kind: true },
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

  const kind = input.kind ?? 'CONTRIBUTION'
  const mode = input.mode ?? 'INFORMATION_ONLY'

  if (mode === 'INFORMATION_ONLY') {
    return prisma.goalContribution.create({
      data: {
        goalId: input.goalId,
        amount: input.amount,
        kind,
        transferId: null,
      },
    })
  }

  const transferAccounts = resolveGoalTransferAccounts(goal, input)

  if (!transferAccounts) {
    throw createGoalError('GOAL_FINANCIAL_MODE_INVALID', 'Invalid goal financial mode')
  }

  await assertUserOwnsAccount(
    userId,
    transferAccounts.sourceAccountId,
    'GOAL_MOVEMENT_ACCOUNT_OWNERSHIP',
    'Goal movement source account must belong to the user',
  )
  await assertUserOwnsAccount(
    userId,
    transferAccounts.destinationAccountId,
    'GOAL_MOVEMENT_ACCOUNT_OWNERSHIP',
    'Goal movement destination account must belong to the user',
  )

  const movementDate = resolveMovementDate(input.movementDate)

  return prisma.$transaction(async (tx) => {
    const transfer = await tx.transfer.create({
      data: {
        userId,
        sourceAccountId: transferAccounts.sourceAccountId,
        destinationAccountId: transferAccounts.destinationAccountId,
        amount: input.amount,
        description: buildGoalTransferDescription(goal.name, mode),
        competenceDate: movementDate,
        dueDate: movementDate,
        paidAt: movementDate,
        status: 'PAID',
      },
    })

    return tx.goalContribution.create({
      data: {
        goalId: input.goalId,
        amount: input.amount,
        kind,
        transferId: transfer.id,
      },
    })
  })
}
