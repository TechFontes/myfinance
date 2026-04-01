import { notFound, redirect } from 'next/navigation'

import { InvoiceDetails } from '@/components/invoices/InvoiceDetails'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type InvoicePageProps = {
  params: Promise<{
    invoiceId: string
  }>
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const user = await getUserFromRequest()
  const { invoiceId: rawInvoiceId } = await params

  if (!user) {
    return redirect(`/login?callbackUrl=${encodeURIComponent(`/dashboard/invoices/${rawInvoiceId}`)}`)
  }

  const invoiceId = Number(rawInvoiceId)

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
    notFound()
  }

  return (
    <InvoiceDetails
      invoice={{
        id: invoice.id,
        month: invoice.month,
        year: invoice.year,
        status: invoice.status,
        total: invoice.total.toString(),
        dueDate: invoice.dueDate,
        creditCard: {
          id: invoice.creditCard.id,
          name: invoice.creditCard.name,
          closeDay: invoice.creditCard.closeDay,
          dueDay: invoice.creditCard.dueDay,
        },
        transactions: invoice.transactions.map((transaction) => ({
          id: transaction.id,
          description: transaction.description,
          value: transaction.value.toString(),
          status: transaction.status,
          competenceDate: transaction.competenceDate,
          dueDate: transaction.dueDate,
          paidAt: transaction.paidAt ?? null,
          installmentGroupId: transaction.installmentGroupId ?? null,
          installment: transaction.installment ?? null,
          installments: transaction.installments ?? null,
        })),
      }}
    />
  )
}
