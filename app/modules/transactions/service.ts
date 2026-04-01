import { prisma } from '@/lib/prisma'
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

export async function createTransactionForUser(
  userId: string,
  input: TransactionCreateInput,
) {
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

  return prisma.transaction.update({
    where: { id: transactionId },
    data: buildUpdateData(input),
  })
}
