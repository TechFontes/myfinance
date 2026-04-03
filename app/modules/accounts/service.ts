import { prisma } from '@/lib/prisma'
import type { AccountCreateInput, AccountUpdateInput } from './contracts'

type AccountRecord = {
  id: number
  userId: string
  name: string
  type: 'BANK' | 'WALLET' | 'OTHER'
  initialBalance: string
  active: boolean
  institution: string | null
  color: string | null
  icon: string | null
  createdAt: Date
  updatedAt: Date
}

function mapAccountRecord(account: {
  id: number
  userId: string
  name: string
  type: 'BANK' | 'WALLET' | 'OTHER'
  initialBalance: { toString(): string }
  active: boolean
  institution: string | null
  color: string | null
  icon: string | null
  createdAt: Date
  updatedAt: Date
}): AccountRecord {
  return {
    ...account,
    initialBalance: account.initialBalance.toString(),
  }
}

export async function listAccountsByUser(userId: string): Promise<AccountRecord[]> {
  const accounts = await prisma.account.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  })

  return accounts.map(mapAccountRecord)
}

export async function getAccountByIdForUser(
  userId: string,
  accountId: number,
): Promise<AccountRecord | null> {
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  })

  if (!account) {
    return null
  }

  return mapAccountRecord(account)
}

export async function createAccountForUser(
  userId: string,
  input: AccountCreateInput,
): Promise<AccountRecord> {
  const account = await prisma.account.create({
    data: {
      userId,
      name: input.name,
      type: input.type,
      initialBalance: input.initialBalance ?? '0.00',
      institution: input.institution ?? null,
      color: input.color ?? null,
      icon: input.icon ?? null,
      active: true,
    },
  })

  return mapAccountRecord(account)
}

export async function updateAccountForUser(
  userId: string,
  accountId: number,
  input: AccountUpdateInput,
): Promise<AccountRecord | null> {
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  })

  if (!account) {
    return null
  }

  const updatedAccount = await prisma.account.update({
    where: { id: accountId },
    data: {
      name: input.name,
      type: input.type,
      initialBalance: input.initialBalance,
      institution: input.institution,
      color: input.color,
      icon: input.icon,
      active: input.active,
    },
  })

  return mapAccountRecord(updatedAccount)
}

export async function setAccountActiveState(
  userId: string,
  accountId: number,
  active: boolean,
): Promise<AccountRecord | null> {
  return updateAccountForUser(userId, accountId, { active })
}

export async function deactivateAccountForUser(
  userId: string,
  accountId: number,
): Promise<AccountRecord | null> {
  return setAccountActiveState(userId, accountId, false)
}

export async function computeAccountBalance(
  userId: string,
  accountId: number,
): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  })
  if (!account) return null

  const initialBalance = account.initialBalance.toNumber()

  const [incomeAgg, expenseAgg, transfersInAgg, transfersOutAgg] =
    await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, accountId, type: 'INCOME', status: 'PAID' },
        _sum: { value: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, accountId, type: 'EXPENSE', status: 'PAID' },
        _sum: { value: true },
      }),
      prisma.transfer.aggregate({
        where: { userId, destinationAccountId: accountId, status: 'PAID' },
        _sum: { amount: true },
      }),
      prisma.transfer.aggregate({
        where: { userId, sourceAccountId: accountId, status: 'PAID' },
        _sum: { amount: true },
      }),
    ])

  const income = incomeAgg._sum.value?.toNumber() ?? 0
  const expense = expenseAgg._sum.value?.toNumber() ?? 0
  const transfersIn = transfersInAgg._sum.amount?.toNumber() ?? 0
  const transfersOut = transfersOutAgg._sum.amount?.toNumber() ?? 0

  const balance = initialBalance + income - expense + transfersIn - transfersOut
  return balance.toFixed(2)
}
