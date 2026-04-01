import type { Prisma } from '@prisma/client'
import {
  createTransactionForUser,
  listTransactionsByUser as listTransactionsByUserForUser,
} from '@/modules/transactions/service'

type LegacyTransactionInput = Prisma.TransactionCreateInput & {
  user?: {
    connect?: {
      id?: string
    }
  }
  amount?: string
  date?: Date | string
}

function normalizeLegacyTransactionInput(data: LegacyTransactionInput) {
  const userId = data.user?.connect?.id

  if (!userId) {
    throw new Error('Transaction user id is required')
  }

  const competenceDate = data.competenceDate ?? data.date
  const dueDate = data.dueDate ?? data.date ?? competenceDate

  if (!competenceDate || !dueDate) {
    throw new Error('Transaction dates are required')
  }

  return {
    userId,
    type: data.type,
    description: data.description,
    value: (data.value ?? data.amount) as string,
    categoryId: data.categoryId,
    accountId: data.accountId ?? null,
    creditCardId: data.creditCardId ?? null,
    invoiceId: data.invoiceId ?? null,
    competenceDate,
    dueDate,
    paidAt: data.paidAt ?? null,
    status: data.status ?? 'PLANNED',
    fixed: data.fixed ?? false,
    installment: data.installment ?? null,
    installments: data.installments ?? null,
  }
}

function mapLegacyTransaction(transaction: {
  competenceDate: Date
  [key: string]: unknown
}) {
  return {
    ...transaction,
    date: transaction.competenceDate,
  }
}

export async function listTransactionsByUser(userId: string) {
  const transactions = await listTransactionsByUserForUser(userId)
  return transactions.map(mapLegacyTransaction)
}

export async function createTransaction(data: LegacyTransactionInput) {
  return createTransactionForUser(
    normalizeLegacyTransactionInput(data).userId,
    normalizeLegacyTransactionInput(data),
  )
}
