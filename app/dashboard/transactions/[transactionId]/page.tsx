import { notFound, redirect } from 'next/navigation'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { getUserFromRequest } from '@/lib/auth'
import { getTransactionByUser } from '@/modules/transactions/service'
import { getTransactionFormOptions } from '@/services/transactionFormOptions'

function parseTransactionId(value: string) {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export default async function EditTransactionPage({
  params,
  searchParams,
}: {
  params: Promise<{ transactionId: string }>
  searchParams: Promise<{ action?: string }>
}) {
  const user = await getUserFromRequest()

  if (!user) {
    return redirect('/login?callbackUrl=%2Fdashboard%2Ftransactions')
  }

  const [{ transactionId: transactionIdParam }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ])
  const transactionId = parseTransactionId(transactionIdParam)

  if (!transactionId) {
    return notFound()
  }

  const [transaction, options] = await Promise.all([
    getTransactionByUser(user.id, transactionId),
    getTransactionFormOptions(),
  ])

  if (!transaction) {
    return notFound()
  }

  return (
    <TransactionForm
      action={resolvedSearchParams.action === 'pay' ? 'pay' : 'default'}
      initialValues={{
        id: transaction.id,
        type: transaction.type,
        description: transaction.description,
        value: transaction.value.toString(),
        categoryId: transaction.categoryId,
        accountId: transaction.accountId,
        creditCardId: transaction.creditCardId,
        invoiceId: transaction.invoiceId,
        competenceDate: transaction.competenceDate,
        dueDate: transaction.dueDate,
        paidAt: transaction.paidAt,
        status: transaction.status,
        fixed: transaction.fixed,
        installment: transaction.installment,
        installments: transaction.installments,
      }}
      mode="edit"
      options={options}
    />
  )
}
