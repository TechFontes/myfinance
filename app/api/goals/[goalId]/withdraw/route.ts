import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getUserFromRequest } from '@/lib/auth'
import { recordGoalWithdrawalForUser } from '@/modules/goals/service'

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
    const body = await request.json()
    const { amount, transferId } = body

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: 'amount is required and must be positive' },
        { status: 400 },
      )
    }

    const result = await recordGoalWithdrawalForUser(user.id, goalId, {
      amount: String(amount),
      transferId: transferId ? Number(transferId) : undefined,
    })

    if (!result) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    try { revalidatePath('/dashboard') } catch { /* best-effort cache invalidation */ }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      return NextResponse.json(
        { error: (error as { message?: string }).message ?? 'Invalid withdrawal' },
        { status: 400 },
      )
    }

    throw error
  }
}
