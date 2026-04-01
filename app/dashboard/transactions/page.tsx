import { NewTransactionButton } from '@/components/newTransactionButton'
import { getUserFromRequest } from '@/lib/auth'
import { listTransactionsByUser } from '@/modules/transactions/service'
import { TransactionsList } from '@/components/transactions/TransactionsList'

async function getTransactions() {
  const user = await getUserFromRequest()

  if (!user) {
    return []
  }

  return listTransactionsByUser(user.id)
}

export default async function TransactionsPage() {
  const transactions = await getTransactions()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-muted-foreground">
            Veja e gerencie receitas, despesas e seu estado financeiro atual.
          </p>
        </div>

        <NewTransactionButton />
      </div>

      <TransactionsList transactions={transactions} />
    </div>
  )
}
