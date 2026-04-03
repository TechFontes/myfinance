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

  const parsed = goalsUpdateSchema.safeParse({
    ...(await request.json()),
    id: goalId,
  })
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }
  const goal = await updateGoalForUser(user.id, goalId, parsed.data)

  if (!goal) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(goal)
}
