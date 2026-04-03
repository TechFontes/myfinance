import { prisma } from '@/lib/prisma'
import {
  assertInvoiceBelongsToCreditCard,
  assertUserOwnsAccount,
  assertUserOwnsCreditCard,
} from '@/modules/financial-core/invariants'
import type {
  TransactionCreateInput,
  TransactionFilters,
  TransactionUpdateInput,
} from './contracts'

const transactionInclude = {
  category: true,
  account: true,
  creditCard: true,
  invoice: true,
} as const

export type TransactionDomainError = Error & { code: string }

function createTransactionError(code: string, message: string): TransactionDomainError {
  const error = new Error(message) as TransactionDomainError
  error.code = code
  return error
}

function buildTransactionWhere(
  userId: string,
  filters: TransactionFilters = {},
): {
  userId: string
  type?: 'INCOME' | 'EXPENSE'
  status?: TransactionFilters['status']
  categoryId?: number
  accountId?: number
  creditCardId?: number
  competenceDate?: {
    gte?: Date
    lte?: Date
  }
  OR?: Array<{
    description?: {
      contains: string
      mode: 'insensitive'
    }
    category?: {
      name: {
        contains: string
        mode: 'insensitive'
      }
    }
  }>
} {
  const where: {
    userId: string
    type?: 'INCOME' | 'EXPENSE'
    status?: TransactionFilters['status']
    categoryId?: number
    accountId?: number
    creditCardId?: number
    competenceDate?: {
      gte?: Date
      lte?: Date
    }
    OR?: Array<{
      description?: {
        contains: string
        mode: 'insensitive'
      }
      category?: {
        name: {
          contains: string
          mode: 'insensitive'
        }
      }
    }>
  } = {
    userId,
  }

  if (filters.type && filters.type !== 'ALL') {
    where.type = filters.type
  }

  if (filters.status) {
    where.status = filters.status
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId
  }

  if (filters.accountId) {
    where.accountId = filters.accountId
  }

  if (filters.creditCardId) {
    where.creditCardId = filters.creditCardId
  }

  if (filters.periodStart || filters.periodEnd) {
    where.competenceDate = {
      ...(filters.periodStart ? { gte: filters.periodStart } : {}),
      ...(filters.periodEnd ? { lte: filters.periodEnd } : {}),
    }
  }

  if (filters.search) {
    where.OR = [
      {
        description: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
      {
        category: {
          name: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      },
    ]
  }

  return where
}

function buildPagination(filters: TransactionFilters) {
  const hasPage = filters.page !== undefined
  const hasPageSize = filters.pageSize !== undefined

  if (!hasPage && !hasPageSize) {
    return {}
  }

  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 20

  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  }
}

function buildOrderBy() {
  return [
    { competenceDate: 'desc' as const },
    { dueDate: 'desc' as const },
    { createdAt: 'desc' as const },
  ]
}

function buildCreateData(userId: string, input: TransactionCreateInput) {
  return {
    userId,
    type: input.type,
    description: input.description,
    value: input.value,
    categoryId: input.categoryId,
    accountId: input.accountId ?? null,
    creditCardId: input.creditCardId ?? null,
    invoiceId: input.invoiceId ?? null,
    competenceDate: input.competenceDate,
    dueDate: input.dueDate,
    paidAt: input.paidAt ?? null,
    status: input.status ?? 'PLANNED',
    fixed: input.fixed ?? false,
    installment: input.installment ?? null,
    installments: input.installments ?? null,
  }
}

function buildUpdateData(input: TransactionUpdateInput) {
  return {
    type: input.type,
    description: input.description,
    value: input.value,
    categoryId: input.categoryId,
    accountId: input.accountId,
    creditCardId: input.creditCardId,
    invoiceId: input.invoiceId,
    competenceDate: input.competenceDate,
    dueDate: input.dueDate,
    paidAt: input.paidAt,
    status: input.status,
    fixed: input.fixed,
    installment: input.installment,
    installments: input.installments,
  }
}

function resolveNextValue<T>(nextValue: T | undefined, currentValue: T) {
  return nextValue === undefined ? currentValue : nextValue
}

function assertTransactionInputInvariants(
  input: Pick<
    TransactionCreateInput,
    'accountId' | 'creditCardId' | 'status' | 'paidAt'
  >,
) {
  if (input.accountId != null && input.creditCardId != null) {
    throw createTransactionError(
      'TRANSACTION_ACCOUNT_CARD_CONFLICT',
      'Transactions cannot target account and credit card at the same time',
    )
  }

  if (input.status === 'PAID' && input.paidAt == null) {
    throw createTransactionError(
      'TRANSACTION_PAID_AT_REQUIRED',
      'Paid transactions require a paidAt date',
    )
  }
}

async function assertTransactionRelations(
  userId: string,
  input: Pick<TransactionCreateInput, 'accountId' | 'creditCardId' | 'invoiceId'>,
) {
  if (input.accountId != null) {
    await assertUserOwnsAccount(
      userId,
      input.accountId,
      'TRANSACTION_ACCOUNT_OWNERSHIP',
      'Transaction account must belong to the user',
    )
  }

  if (input.creditCardId != null) {
    await assertUserOwnsCreditCard(
      userId,
      input.creditCardId,
      'TRANSACTION_CARD_OWNERSHIP',
      'Transaction credit card must belong to the user',
    )
  }

  if (input.invoiceId != null) {
    if (input.creditCardId == null) {
      throw createTransactionError(
        'TRANSACTION_INVOICE_CARD_REQUIRED',
        'Invoice-linked transactions require a selected credit card',
      )
    }

    await assertInvoiceBelongsToCreditCard(
      input.invoiceId,
      input.creditCardId,
      'TRANSACTION_INVOICE_CARD_MISMATCH',
      'Transaction invoice must belong to the selected credit card',
    )
  }
}

export async function listTransactionsByUser(
  userId: string,
  filters: TransactionFilters = {},
) {
  const pagination = buildPagination(filters)

  return prisma.transaction.findMany({
    where: buildTransactionWhere(userId, filters),
    orderBy: buildOrderBy(),
    include: transactionInclude,
    ...(pagination.skip !== undefined ? { skip: pagination.skip } : {}),
    ...(pagination.take !== undefined ? { take: pagination.take } : {}),
  })
}

export async function countTransactionsByUser(
  userId: string,
  filters: TransactionFilters = {},
) {
  return prisma.transaction.count({
    where: buildTransactionWhere(userId, filters),
  })
}

export async function getTransactionByUser(userId: string, transactionId: number) {
  return prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
    include: transactionInclude,
  })
}

export async function createTransactionForUser(
  userId: string,
  input: TransactionCreateInput,
) {
  assertTransactionInputInvariants(input)
  await assertTransactionRelations(userId, input)

  return prisma.transaction.create({
    data: buildCreateData(userId, input),
  })
}

export async function updateTransactionByUser(
  userId: string,
  transactionId: number,
  input: TransactionUpdateInput,
) {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
  })

  if (!transaction) {
    return null
  }

  const nextState: TransactionCreateInput = {
    type: resolveNextValue(input.type, transaction.type),
    description: resolveNextValue(input.description, transaction.description),
    value: resolveNextValue(input.value, transaction.value.toString()),
    categoryId: resolveNextValue(input.categoryId, transaction.categoryId),
    accountId: resolveNextValue(input.accountId, transaction.accountId),
    creditCardId: resolveNextValue(input.creditCardId, transaction.creditCardId),
    invoiceId: resolveNextValue(input.invoiceId, transaction.invoiceId),
    competenceDate: resolveNextValue(input.competenceDate, transaction.competenceDate),
    dueDate: resolveNextValue(input.dueDate, transaction.dueDate),
    paidAt: resolveNextValue(input.paidAt, transaction.paidAt),
    status: resolveNextValue(input.status, transaction.status),
    fixed: resolveNextValue(input.fixed, transaction.fixed),
    installment: resolveNextValue(input.installment, transaction.installment),
    installments: resolveNextValue(input.installments, transaction.installments),
  }

  assertTransactionInputInvariants(nextState)
  await assertTransactionRelations(userId, nextState)

  return prisma.transaction.update({
    where: { id: transactionId },
    data: buildUpdateData(input),
  })
}

export async function settleTransactionForUser(
  userId: string,
  transactionId: number,
  input: { accountId: number; paidAt: Date },
): Promise<object | null> {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
  })

  if (!transaction) return null

  if (transaction.status === 'PAID' || transaction.status === 'CANCELED') {
    throw createTransactionError(
      'TRANSACTION_SETTLE_INVALID_STATUS',
      `Cannot settle transaction with status ${transaction.status}`,
    )
  }

  const account = await prisma.account.findFirst({
    where: { id: input.accountId, userId },
  })

  if (!account) {
    throw createTransactionError(
      'TRANSACTION_ACCOUNT_OWNERSHIP',
      'Account not found or not owned by user',
    )
  }

  return prisma.transaction.update({
    where: { id: transactionId },
    data: { status: 'PAID', accountId: input.accountId, paidAt: input.paidAt },
  })
}

export async function cancelTransactionForUser(
  userId: string,
  transactionId: number,
): Promise<object | null> {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
  })

  if (!transaction) return null

  if (transaction.status === 'CANCELED') {
    throw createTransactionError(
      'TRANSACTION_CANCEL_INVALID_STATUS',
      'Transaction is already canceled',
    )
  }

  return prisma.transaction.update({
    where: { id: transactionId },
    data: { status: 'CANCELED' },
  })
}
