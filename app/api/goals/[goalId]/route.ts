import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { updateGoalForUser } from '@/modules/goals/service'
import { goalsUpdateSchema } from '@/modules/goals'

function parseGoalId(goalId: string) {
  const parsedId = Number(goalId)

  return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ goalId: string }> },
) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { goalId: goalIdParam } = await params
  const goalId = parseGoalId(goalIdParam)

  if (!goalId) {
    return NextResponse.json({ error: 'Invalid goal id' }, { status: 400 })
  }

  const payload = goalsUpdateSchema.parse({
    ...(await request.json()),
    id: goalId,
  })
  const goal = await updateGoalForUser(user.id, goalId, payload)

  if (!goal) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(goal)
}
