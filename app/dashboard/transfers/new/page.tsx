import { redirect } from 'next/navigation'
import { TransferCreateForm } from '@/components/transfers/TransferCreateForm'
import { getUserFromRequest } from '@/lib/auth'
import { listAccountsByUser } from '@/modules/accounts/service'

export default async function TransferCreatePage() {
  const user = await getUserFromRequest()

  if (!user) {
    return redirect('/login?callbackUrl=%2Fdashboard%2Ftransfers%2Fnew')
  }

  const accounts = await listAccountsByUser(user.id)

  return (
    <TransferCreateForm
      accounts={accounts.filter((account) => account.active).map((account) => ({
        id: account.id,
        name: account.name,
      }))}
    />
  )
}
