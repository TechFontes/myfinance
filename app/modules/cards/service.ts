import type { CreditCard, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { CreditCardCreateInput, CreditCardUpdateInput } from './contracts'

export async function listCardsByUser(userId: string): Promise<CreditCard[]> {
  return prisma.creditCard.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  })
}

export async function createCardForUser(
  userId: string,
  input: CreditCardCreateInput,
): Promise<CreditCard> {
  return prisma.creditCard.create({
    data: {
      userId,
      name: input.name,
      limit: input.limit,
      closeDay: input.closeDay,
      dueDay: input.dueDay,
      color: input.color ?? null,
      icon: input.icon ?? null,
      active: input.active ?? true,
    },
  })
}

export async function updateCardForUser(
  userId: string,
  cardId: number,
  input: CreditCardUpdateInput,
): Promise<CreditCard | null> {
  const card = await prisma.creditCard.findFirst({
    where: { id: cardId, userId },
  })

  if (!card) {
    return null
  }

  return prisma.creditCard.update({
    where: { id: cardId },
    data: {
      name: input.name,
      limit: input.limit,
      closeDay: input.closeDay,
      dueDay: input.dueDay,
      color: input.color,
      icon: input.icon,
      active: input.active,
    } satisfies Prisma.CreditCardUpdateInput,
  })
}

export async function setCardActiveState(
  userId: string,
  cardId: number,
  active: boolean,
): Promise<CreditCard | null> {
  return updateCardForUser(userId, cardId, { active })
}

export async function deactivateCardForUser(
  userId: string,
  cardId: number,
): Promise<CreditCard | null> {
  return setCardActiveState(userId, cardId, false)
}
