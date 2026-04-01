import { notFound } from 'next/navigation'

import { InvoiceDetails } from '@/components/invoices/InvoiceDetails'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type InvoicePageProps = {
  params: {
    invoiceId: string
  }
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const user = await getUserFromRequest()

  if (!user) {
    notFound()
  }

  const invoiceId = Number(params.invoiceId)

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

  return <InvoiceDetails invoice={invoice} />
}
