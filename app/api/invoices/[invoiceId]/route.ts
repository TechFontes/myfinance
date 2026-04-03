import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getUserFromRequest } from '@/lib/auth'
import { getInvoiceByIdForUser, payInvoiceForUser } from '@/modules/invoices/service'

function parseInvoiceId(raw: string): number | null {
  const id = Number(raw)
  return Number.isInteger(id) && id > 0 ? id : null
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { invoiceId: invoiceIdParam } = await params
  const invoiceId = parseInvoiceId(invoiceIdParam)

  if (!invoiceId) {
    return NextResponse.json({ error: 'Invalid invoice id' }, { status: 400 })
  }

  const invoice = await getInvoiceByIdForUser(user.id, invoiceId)

  if (!invoice) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(invoice)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { invoiceId: invoiceIdParam } = await params
  const body = await request.json()

  if ('sourceAccountId' in body) {
    return NextResponse.json(
      { error: 'Unsupported invoice update field: sourceAccountId' },
      { status: 400 },
    )
  }

  if ('total' in body) {
    return NextResponse.json(
      { error: 'Unsupported invoice update field: total' },
      { status: 400 },
    )
  }

  const invoiceId = parseInvoiceId(invoiceIdParam)

  if (!invoiceId) {
    return NextResponse.json({ error: 'Invalid invoice id' }, { status: 400 })
  }

  if (body.status !== 'PAID') {
    return NextResponse.json(
      { error: 'Unsupported invoice update operation' },
      { status: 400 },
    )
  }

  const updatedInvoice = await payInvoiceForUser(user.id, invoiceId)

  if (!updatedInvoice) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try { revalidatePath('/dashboard') } catch { /* best-effort cache invalidation */ }

  return NextResponse.json(updatedInvoice)
}
