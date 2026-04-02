import { notFound, redirect } from 'next/navigation'
import { TransferForm } from '@/components/transfers/TransferForm'
import { getUserFromRequest } from '@/lib/auth'
import { listAccountsByUser } from '@/modules/accounts/service'
import { getTransferByUser } from '@/modules/transfers/service'

function parseTransferId(value: string) {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export default async function EditTransferPage({
  params,
}: {
  params: Promise<{ transferId: string }>
}) {
  const user = await getUserFromRequest()

  if (!user) {
    return redirect('/login?callbackUrl=%2Fdashboard%2Ftransfers')
  }

  const { transferId: transferIdParam } = await params
  const transferId = parseTransferId(transferIdParam)

  if (!transferId) {
    return notFound()
  }

  const [transfer, accounts] = await Promise.all([
    getTransferByUser(user.id, transferId),
    listAccountsByUser(user.id),
  ])

  if (!transfer) {
    return notFound()
  }

  return (
    <TransferForm
      accounts={accounts
        .filter((account) => account.active)
        .map((account) => ({ id: account.id, name: account.name }))}
      initialValues={{
        id: transfer.id,
        sourceAccountId: transfer.sourceAccountId,
        destinationAccountId: transfer.destinationAccountId,
        amount: transfer.amount,
        description: transfer.description,
        competenceDate: transfer.competenceDate,
        dueDate: transfer.dueDate,
        paidAt: transfer.paidAt,
        status: transfer.status,
      }}
      mode="edit"
    />
  )
}
