import { PlusIcon } from 'lucide-react'

import { AccountsList } from '@/components/accounts/AccountsList'
import { Button } from '@/components/ui/button'
import { getUserFromRequest } from '@/lib/auth'
import { listAccountsByUser } from '@/services/accountService'

async function getAccounts() {
  const user = await getUserFromRequest();
  if (!user) {
    return [];
  }

  const accounts = await listAccountsByUser(user.id);

  return accounts
}

export default async function AccountsPage() {
  const accounts = await getAccounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contas</h1>
          <p className="text-muted-foreground">
            Gerencie contas bancárias, carteiras e saldos iniciais
          </p>
        </div>

        <Button className="flex items-center gap-2">
          <PlusIcon size={16} />
          Nova conta
        </Button>
      </div>

      <AccountsList accounts={accounts} />
    </div>
  );
}
