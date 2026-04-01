import { prisma } from '@/lib/prisma'
import type { CreditCardCreateInput, CreditCardUpdateInput } from './contracts'

type CreditCardRecord = {
  id: number
  userId: string
  name: string
  limit: string
  closeDay: number
  dueDay: number
  color: string | null
  icon: string | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}

function mapCreditCardRecord(card: {
  id: number
  userId: string
  name: string
  limit: { toString(): string }
  closeDay: number
  dueDay: number
  active: boolean
  createdAt: Date
  updatedAt?: Date
}): CreditCardRecord {
  return {
    ...card,
    limit: card.limit.toString(),
    color: null,
    icon: null,
    updatedAt: card.updatedAt ?? card.createdAt,
  }
}

export async function listCardsByUser(userId: string): Promise<CreditCardRecord[]> {
  const cards = await prisma.creditCard.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  })

  return cards.map(mapCreditCardRecord)
}

export async function createCardForUser(
  userId: string,
  input: CreditCardCreateInput,
): Promise<CreditCardRecord> {
  const card = await prisma.creditCard.create({
    data: {
      userId,
      name: input.name,
      limit: input.limit,
      closeDay: input.closeDay,
      dueDay: input.dueDay,
      active: input.active ?? true,
    },
  })

  return mapCreditCardRecord(card)
}

export async function updateCardForUser(
  userId: string,
  cardId: number,
  input: CreditCardUpdateInput,
): Promise<CreditCardRecord | null> {
  const card = await prisma.creditCard.findFirst({
    where: { id: cardId, userId },
  })

  if (!card) {
    return null
  }

  const updatedCard = await prisma.creditCard.update({
    where: { id: cardId },
    data: {
      name: input.name,
      limit: input.limit,
      closeDay: input.closeDay,
      dueDay: input.dueDay,
      active: input.active,
    },
  })

  return mapCreditCardRecord(updatedCard)
}

export async function setCardActiveState(
  userId: string,
  cardId: number,
  active: boolean,
): Promise<CreditCardRecord | null> {
  return updateCardForUser(userId, cardId, { active })
}

export async function deactivateCardForUser(
  userId: string,
  cardId: number,
): Promise<CreditCardRecord | null> {
  return setCardActiveState(userId, cardId, false)
}
