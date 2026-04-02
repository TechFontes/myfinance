import { notFound, redirect } from 'next/navigation'

import { AccountCreateForm } from '@/components/accounts/AccountCreateForm'
import { getUserFromRequest } from '@/lib/auth'
import { getAccountByIdForUser } from '@/modules/accounts/service'

function parseAccountId(value: string) {
  const accountId = Number(value)

  return Number.isInteger(accountId) && accountId > 0 ? accountId : null
}

export default async function AccountEditPage({
  params,
}: {
  params: Promise<{ accountId: string }>
}) {
  const user = await getUserFromRequest()

  if (!user) {
    const { accountId } = await params
    return redirect(`/login?callbackUrl=%2Fdashboard%2Faccounts%2F${accountId}`)
  }

  const { accountId: accountIdParam } = await params
  const accountId = parseAccountId(accountIdParam)

  if (!accountId) {
    return notFound()
  }

  const account = await getAccountByIdForUser(user.id, accountId)

  if (!account) {
    return notFound()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Editar conta</h1>
        <p className="text-muted-foreground">
          Atualize os dados principais da conta sem sair da gestão financeira.
        </p>
      </div>

      <AccountCreateForm mode="edit" account={account} />
    </div>
  )
}
