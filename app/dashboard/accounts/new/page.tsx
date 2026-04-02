import { redirect } from 'next/navigation'

import { AccountCreateForm } from '@/components/accounts/AccountCreateForm'
import { getUserFromRequest } from '@/lib/auth'

export default async function NewAccountPage() {
  const user = await getUserFromRequest()

  if (!user) {
    return redirect('/login?callbackUrl=%2Fdashboard%2Faccounts%2Fnew')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Nova conta</h1>
        <p className="text-muted-foreground">
          Cadastre contas bancárias, carteiras e saldos iniciais.
        </p>
      </div>

      <AccountCreateForm />
    </div>
  )
}
