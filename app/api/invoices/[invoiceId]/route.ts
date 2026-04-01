import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { invoiceUpdateSchema } from '@/modules/invoices'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { invoiceId: invoiceIdParam } = await params
  const invoiceId = Number(invoiceIdParam)
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      creditCard: {
        userId: user.id,
      },
    },
    include: {
      creditCard: true,
      transactions: {
        orderBy: [{ competenceDate: 'asc' }, { installment: 'asc' }, { id: 'asc' }],
      },
    },
  })

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

  const payload = invoiceUpdateSchema.parse({
    ...body,
    id: Number(invoiceIdParam),
  })

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: Number(invoiceIdParam),
      creditCard: {
        userId: user.id,
      },
    },
  })

  if (!invoice) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updatedInvoice = await prisma.invoice.update({
    where: { id: Number(invoiceIdParam) },
    data: {
      creditCardId: payload.creditCardId,
      month: payload.month,
      year: payload.year,
      dueDate: payload.dueDate,
      status: payload.status,
      total: payload.total,
    },
  })

  return NextResponse.json(updatedInvoice)
}
