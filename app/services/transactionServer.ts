// services/transactionService.ts
import { prisma } from '@/lib/prisma'
import type { Transaction, Prisma } from '@prisma/client'

export async function listTransactionsByUser(userId: string) {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    include: {category:true}
  })
}

export async function createTransaction(
  data: Prisma.TransactionCreateInput
): Promise<Transaction> {
  return prisma.transaction.create({ data })
}
