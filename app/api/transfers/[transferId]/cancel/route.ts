import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getUserFromRequest } from '@/lib/auth'
import { cancelTransferForUser } from '@/modules/transfers/service'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ transferId: string }> },
) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { transferId: transferIdParam } = await params
    const transferId = Number(transferIdParam)

    if (!Number.isInteger(transferId) || transferId <= 0) {
      return NextResponse.json({ error: 'Invalid transfer ID' }, { status: 400 })
    }

    const result = await cancelTransferForUser(user.id, transferId)

    if (!result) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 })
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
