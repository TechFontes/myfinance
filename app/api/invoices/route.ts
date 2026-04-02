import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { listInvoicesByCard } from '@/modules/invoices/service'

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const creditCardId = Number(new URL(request.url).searchParams.get('creditCardId'))

  if (!creditCardId || Number.isNaN(creditCardId)) {
    return NextResponse.json({ error: 'creditCardId is required' }, { status: 400 })
  }

  const invoices = await listInvoicesByCard(user.id, creditCardId)

  return NextResponse.json(invoices)
}
