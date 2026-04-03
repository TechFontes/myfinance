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

  const parsed = transactionUpdateSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }
  const transaction = await updateTransactionByUser(user.id, transactionId, parsed.data)

  if (!transaction) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try { revalidatePath('/dashboard') } catch { /* best-effort cache invalidation */ }

  return NextResponse.json(transaction)
}
