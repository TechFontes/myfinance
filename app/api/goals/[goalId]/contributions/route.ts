import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { recordGoalContributionForUser } from '@/modules/goals/service'
import { goalContributionSchema } from '@/modules/goals'

function parseGoalId(goalId: string) {
  const parsedId = Number(goalId)

  return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null
}

export async function POST(
  request: NextRequest,
  { params }: { params: { goalId: string } },
) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const goalId = parseGoalId(params.goalId)

  if (!goalId) {
    return NextResponse.json({ error: 'Invalid goal id' }, { status: 400 })
  }

  const payload = goalContributionSchema.parse({
    ...(await request.json()),
    goalId,
  })
  const contribution = await recordGoalContributionForUser(user.id, payload)

  if (!contribution) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(contribution, { status: 201 })
}
