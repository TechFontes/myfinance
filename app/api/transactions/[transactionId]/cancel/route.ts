import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getUserFromRequest } from '@/lib/auth'
import { cancelTransactionForUser } from '@/modules/transactions/service'

function parseTransactionId(transactionId: string) {
  const parsedId = Number(transactionId)

  return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null
}

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> },
) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { transactionId: transactionIdParam } = await params
  const transactionId = parseTransactionId(transactionIdParam)

  if (!transactionId) {
    return NextResponse.json({ error: 'Invalid transaction id' }, { status: 400 })
  }

  try {
    const result = await cancelTransactionForUser(user.id, transactionId)

    if (!result) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    try { revalidatePath('/dashboard') } catch { /* best-effort cache invalidation */ }

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
