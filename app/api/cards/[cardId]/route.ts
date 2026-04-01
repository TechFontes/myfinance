import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { updateCardForUser } from '@/modules/cards/service'
import { cardUpdateSchema } from '@/modules/cards'

function parseCardId(cardId: string) {
  const parsedId = Number(cardId)

  return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { cardId: string } },
) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cardId = parseCardId(params.cardId)

  if (!cardId) {
    return NextResponse.json({ error: 'Invalid card id' }, { status: 400 })
  }

  const payload = cardUpdateSchema.parse(await request.json())
  const card = await updateCardForUser(user.id, cardId, payload)

  if (!card) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(card)
}
