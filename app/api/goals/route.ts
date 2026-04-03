import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { createGoalForUser, listGoalsByUser } from '@/modules/goals/service'
import { goalsCreateSchema } from '@/modules/goals'

export async function GET() {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const goals = await listGoalsByUser(user.id)

  return NextResponse.json(goals)
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = goalsCreateSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }
  const goal = await createGoalForUser(user.id, parsed.data)

  return NextResponse.json(goal, { status: 201 })
}
