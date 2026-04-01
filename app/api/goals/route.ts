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

  const payload = goalsCreateSchema.parse(await request.json())
  const goal = await createGoalForUser(user.id, payload)

  return NextResponse.json(goal, { status: 201 })
}
