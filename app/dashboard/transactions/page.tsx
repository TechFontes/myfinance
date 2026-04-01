import { NewTransactionButton } from '@/components/newTransactionButton'
import { getUserFromRequest } from '@/lib/auth'
import { listTransactionsByUser } from '@/modules/transactions/service'
import { TransactionsList } from '@/components/transactions/TransactionsList'
import { redirect } from 'next/navigation'

export default async function TransactionsPage() {
  const user = await getUserFromRequest()

  if (!user) {
    return redirect('/login?callbackUrl=%2Fdashboard%2Ftransactions')
  }

  const transactions = await listTransactionsByUser(user.id)

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

      <TransactionsList
        transactions={transactions.map((transaction) => {
          const categoryTransaction = transaction as typeof transaction & {
            category?: {
              name: string | null
            } | null
          }

          return {
            id: transaction.id,
            description: transaction.description,
            type: transaction.type,
            value: transaction.value.toString(),
            status: transaction.status,
            competenceDate: transaction.competenceDate,
            dueDate: transaction.dueDate,
            paidAt: transaction.paidAt ?? null,
            category: categoryTransaction.category
            ? {
                name: categoryTransaction.category.name,
              }
            : null,
          }
        })}
      />
    </div>
  )
}
