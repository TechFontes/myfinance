import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getUserFromRequest } from '@/lib/auth'
import { listTransfersByUser } from '@/modules/transfers/service'
import { TransfersList } from '@/components/transfers/TransfersList'

function buildTransferLabel(id: number) {
  return `Conta #${id}`
}

export default async function TransfersPage() {
  const user = await getUserFromRequest()

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movimentações internas</h1>
          <p className="text-muted-foreground">Transferências entre contas que não entram como receita ou despesa.</p>
        </div>
        <Card className="border-dashed p-6 text-sm text-muted-foreground">
          Acesse sua conta para visualizar as movimentações internas.
        </Card>
      </div>
    )
  }

  const transfers = await listTransfersByUser(user.id)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            Fluxo interno
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Movimentações internas</h1>
          <p className="text-muted-foreground">Transferências entre contas.</p>
        </div>

        <Button className="w-full md:w-auto">Nova transferência</Button>
      </div>

      <Card className="border-dashed p-4 text-sm text-muted-foreground">
        Este painel reúne apenas movimentações internas. Ele não altera o total de receitas ou despesas do período.
      </Card>

      <TransfersList
        transfers={transfers.map((transfer) => ({
          id: transfer.id,
          sourceAccountLabel: buildTransferLabel(transfer.sourceAccountId),
          destinationAccountLabel: buildTransferLabel(transfer.destinationAccountId),
          amount: transfer.amount.toString(),
          description: transfer.description,
          competenceDate: transfer.competenceDate,
          dueDate: transfer.dueDate,
          paidAt: transfer.paidAt,
          status: transfer.status,
        }))}
      />
    </div>
  )
}
