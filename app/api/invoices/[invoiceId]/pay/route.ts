import { getUserFromRequest } from '@/lib/auth'
import { payInvoiceForUserE2E } from '@/modules/invoices/service'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const user = await getUserFromRequest()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { invoiceId } = await params
  const id = Number(invoiceId)
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid invoice ID' }, { status: 400 })
  }

  const body = await request.json()
  const accountId = Number(body.accountId)
  const categoryId = Number(body.categoryId)
  const paidAt = new Date(body.paidAt)

  if (!Number.isInteger(accountId) || accountId <= 0) {
    return NextResponse.json({ error: 'accountId is required' }, { status: 400 })
  }
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return NextResponse.json({ error: 'categoryId is required' }, { status: 400 })
  }
  if (isNaN(paidAt.getTime())) {
    return NextResponse.json({ error: 'Invalid paidAt' }, { status: 400 })
  }

  try {
    const result = await payInvoiceForUserE2E(user.id, id, { accountId, categoryId, paidAt })
    if (!result) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    try { revalidatePath('/dashboard') } catch { /* best-effort cache invalidation */ }
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
