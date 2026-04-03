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
  { params }: { params: Promise<{ cardId: string }> },
) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { cardId: cardIdParam } = await params
  const cardId = parseCardId(cardIdParam)

  if (!cardId) {
    return NextResponse.json({ error: 'Invalid card id' }, { status: 400 })
  }

  const parsed = cardUpdateSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }
  const card = await updateCardForUser(user.id, cardId, parsed.data)

  if (!card) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(card)
}
