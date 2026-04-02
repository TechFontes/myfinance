import { prisma } from '@/lib/prisma'

export type FinancialInvariantError = Error & { code: string }

export function createFinancialInvariantError(
  code: string,
  message: string,
): FinancialInvariantError {
  const error = new Error(message) as FinancialInvariantError
  error.code = code
  return error
}

export async function assertUserOwnsAccount(
  userId: string,
  accountId: number,
  code: string,
  message: string,
) {
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
    select: { id: true },
  })

  if (!account) {
    throw createFinancialInvariantError(code, message)
  }
}

export async function assertUserOwnsAccounts(
  userId: string,
  accountIds: number[],
  code: string,
  message: string,
) {
  const accounts = await prisma.account.findMany({
    where: {
      userId,
      id: {
        in: accountIds,
      },
    },
    select: { id: true },
  })

  if (accounts.length !== accountIds.length) {
    throw createFinancialInvariantError(code, message)
  }
}

export async function assertUserOwnsCreditCard(
  userId: string,
  creditCardId: number,
  code: string,
  message: string,
) {
  const creditCard = await prisma.creditCard.findFirst({
    where: { id: creditCardId, userId },
    select: { id: true },
  })

  if (!creditCard) {
    throw createFinancialInvariantError(code, message)
  }
}

export async function assertInvoiceBelongsToCreditCard(
  invoiceId: number,
  creditCardId: number,
  code: string,
  message: string,
) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      creditCardId,
    },
    select: { id: true },
  })

  if (!invoice) {
    throw createFinancialInvariantError(code, message)
  }
}
