import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getUserFromRequest } from '@/lib/auth'
import { updateTransactionByUser } from '@/modules/transactions/service'
import { transactionUpdateSchema } from '@/modules/transactions'

function parseTransactionId(transactionId: string) {
  const parsedId = Number(transactionId)

  return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null
}

export async function PATCH(
  request: NextRequest,
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

  const payload = transactionUpdateSchema.parse(await request.json())
  const transaction = await updateTransactionByUser(user.id, transactionId, payload)

  if (!transaction) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try { revalidatePath('/dashboard') } catch { /* best-effort cache invalidation */ }

  return NextResponse.json(transaction)
}
