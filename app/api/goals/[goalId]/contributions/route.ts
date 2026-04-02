import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { getUserFromRequest } from '@/lib/auth'
import { recordGoalContributionForUser } from '@/modules/goals/service'
import { goalContributionSchema } from '@/modules/goals'

function parseGoalId(goalId: string) {
  const parsedId = Number(goalId)

  return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null
}

export async function POST(
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

  try {
    const payload = goalContributionSchema.parse({
      ...(await request.json()),
      goalId,
    })
    const contribution = await recordGoalContributionForUser(user.id, payload)

    if (!contribution) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(contribution, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? 'Invalid goal movement payload' },
        { status: 400 },
      )
    }

    if (error && typeof error === 'object' && 'code' in error) {
      return NextResponse.json(
        { error: (error as { message?: string }).message ?? 'Invalid goal movement payload' },
        { status: 400 },
      )
    }

    throw error
  }
}
