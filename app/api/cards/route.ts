import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { createCardForUser, listCardsByUser } from '@/modules/cards/service'
import { cardCreateSchema } from '@/modules/cards'

export async function GET() {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cards = await listCardsByUser(user.id)

  return NextResponse.json(cards)
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = cardCreateSchema.parse(await request.json())
  const card = await createCardForUser(user.id, payload)

  return NextResponse.json(card, { status: 201 })
}
