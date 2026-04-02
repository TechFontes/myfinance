import { prisma } from '@/lib/prisma'
import { assertUserOwnsAccounts } from '@/modules/financial-core/invariants'
import type { TransferCreateInput, TransferUpdateInput } from './contracts'

export type TransferDomainError = Error & { code: string }

type TransferRecord = {
  id: number
  userId: string
  sourceAccountId: number
  destinationAccountId: number
  amount: string
  description: string | null
  competenceDate: Date
  dueDate: Date
  paidAt: Date | null
  status: 'PLANNED' | 'PENDING' | 'PAID' | 'CANCELED'
  createdAt: Date
  updatedAt: Date
}

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

async function assertTransferAccountsOwnership(
  userId: string,
  sourceAccountId: number,
  destinationAccountId: number,
) {
  await assertUserOwnsAccounts(
    userId,
    [sourceAccountId, destinationAccountId],
    'TRANSFER_ACCOUNT_OWNERSHIP',
    'Transfer accounts must belong to the same user',
  )
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

function parseOptionalRequiredDate(value?: string | null) {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return undefined
  }

  return new Date(value)
}

function mapTransferRecord(transfer: {
  id: number
  userId: string
  sourceAccountId: number
  destinationAccountId: number
  amount?: { toString(): string } | string | number
  description: string | null
  competenceDate: Date
  dueDate: Date
  paidAt: Date | null
  status: 'PLANNED' | 'PENDING' | 'PAID' | 'CANCELED'
  createdAt: Date
  updatedAt: Date
}): TransferRecord {
  return {
    ...transfer,
    amount: transfer.amount?.toString() ?? '0.00',
  }
}

export async function listTransfersByUser(userId: string): Promise<TransferRecord[]> {
  const transfers = await prisma.transfer.findMany({
    where: { userId },
    orderBy: [{ competenceDate: 'desc' }, { createdAt: 'desc' }],
  })

  return transfers.map(mapTransferRecord)
}

export async function getTransferByUser(
  userId: string,
  transferId: number,
): Promise<TransferRecord | null> {
  const transfer = await prisma.transfer.findFirst({
    where: { id: transferId, userId },
  })

  return transfer ? mapTransferRecord(transfer) : null
}

export async function createTransferForUser(
  userId: string,
  input: TransferCreateInput,
): Promise<TransferRecord> {
  assertDistinctAccounts(input.sourceAccountId, input.destinationAccountId)
  await assertTransferAccountsOwnership(
    userId,
    input.sourceAccountId,
    input.destinationAccountId,
  )

  const transfer = await prisma.transfer.create({
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

  return mapTransferRecord(transfer)
}

export async function updateTransferForUser(
  userId: string,
  transferId: number,
  input: TransferUpdateInput,
): Promise<TransferRecord | null> {
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
  await assertTransferAccountsOwnership(
    userId,
    nextSourceAccountId,
    nextDestinationAccountId,
  )

  const updatedTransfer = await prisma.transfer.update({
    where: { id: transferId },
    data: {
      sourceAccountId: input.sourceAccountId,
      destinationAccountId: input.destinationAccountId,
      amount: input.amount,
      description: input.description,
      competenceDate: parseOptionalRequiredDate(input.competenceDate),
      dueDate: parseOptionalRequiredDate(input.dueDate),
      paidAt: parseOptionalDate(input.paidAt),
      status: input.status,
    },
  })

  return mapTransferRecord(updatedTransfer)
}

export { createTransferError }
