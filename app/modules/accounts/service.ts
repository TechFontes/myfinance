import type { Account } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { AccountCreateInput, AccountUpdateInput } from './contracts'

export async function listAccountsByUser(userId: string): Promise<Account[]> {
  return prisma.account.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  })
}

export async function createAccountForUser(
  userId: string,
  input: AccountCreateInput,
): Promise<Account> {
  return prisma.account.create({
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
}

export async function updateAccountForUser(
  userId: string,
  accountId: number,
  input: AccountUpdateInput,
): Promise<Account | null> {
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  })

  if (!account) {
    return null
  }

  return prisma.account.update({
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
}

export async function setAccountActiveState(
  userId: string,
  accountId: number,
  active: boolean,
): Promise<Account | null> {
  return updateAccountForUser(userId, accountId, { active })
}

export async function deactivateAccountForUser(
  userId: string,
  accountId: number,
): Promise<Account | null> {
  return setAccountActiveState(userId, accountId, false)
}
