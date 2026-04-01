import type { Transfer } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { TransferCreateInput, TransferUpdateInput } from './contracts'

export type TransferDomainError = Error & { code: string }

function createTransferError(code: string, message: string): TransferDomainError {
  const error = new Error(message) as TransferDomainError
  error.code = code
  return error
}

function assertDistinctAccounts(
  sourceAccountId: number,
  destinationAccountId: number,
) {
  if (sourceAccountId === destinationAccountId) {
    throw createTransferError(
      'TRANSFER_SAME_ACCOUNT',
      'Transfer source and destination accounts must be different',
    )
  }
}

function parseOptionalDate(value?: string | null) {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return null
  }

  return new Date(value)
}

export async function listTransfersByUser(userId: string): Promise<Transfer[]> {
  return prisma.transfer.findMany({
    where: { userId },
    orderBy: [{ competenceDate: 'desc' }, { createdAt: 'desc' }],
  })
}

export async function createTransferForUser(
  userId: string,
  input: TransferCreateInput,
): Promise<Transfer> {
  assertDistinctAccounts(input.sourceAccountId, input.destinationAccountId)

  return prisma.transfer.create({
    data: {
      userId,
      sourceAccountId: input.sourceAccountId,
      destinationAccountId: input.destinationAccountId,
      amount: input.amount,
      description: input.description,
      competenceDate: new Date(input.competenceDate),
      dueDate: new Date(input.dueDate),
      paidAt: null,
      status: 'PLANNED',
    },
  })
}

export async function updateTransferForUser(
  userId: string,
  transferId: number,
  input: TransferUpdateInput,
): Promise<Transfer | null> {
  const transfer = await prisma.transfer.findFirst({
    where: { id: transferId, userId },
  })

  if (!transfer) {
    return null
  }

  const nextSourceAccountId = input.sourceAccountId ?? transfer.sourceAccountId
  const nextDestinationAccountId =
    input.destinationAccountId ?? transfer.destinationAccountId

  assertDistinctAccounts(nextSourceAccountId, nextDestinationAccountId)

  return prisma.transfer.update({
    where: { id: transferId },
    data: {
      sourceAccountId: input.sourceAccountId,
      destinationAccountId: input.destinationAccountId,
      amount: input.amount,
      description: input.description,
      competenceDate: parseOptionalDate(input.competenceDate),
      dueDate: parseOptionalDate(input.dueDate),
      paidAt: parseOptionalDate(input.paidAt),
      status: input.status,
    },
  })
}

export { createTransferError }
