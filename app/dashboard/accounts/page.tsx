import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { AccountsList } from '@/components/accounts/AccountsList'
import { Button } from '@/components/ui/button'
import { getUserFromRequest } from '@/lib/auth'
import { listAccountsByUser } from '@/services/accountService'

export default async function AccountsPage() {
  const user = await getUserFromRequest()

  if (!user) {
    return redirect('/login?callbackUrl=%2Fdashboard%2Faccounts')
  }

  const accounts = await listAccountsByUser(user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contas</h1>
          <p className="text-muted-foreground">
            Gerencie contas bancárias, carteiras e saldos iniciais
          </p>
        </div>

        <Button asChild className="flex items-center gap-2">
          <Link href="/dashboard/accounts/new">
            <PlusIcon size={16} />
            Nova conta
          </Link>
        </Button>
      </div>

      <AccountsList accounts={accounts} />
    </div>
  )
}
