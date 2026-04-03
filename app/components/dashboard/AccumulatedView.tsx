import { Card } from '@/components/ui/card'
import { PatrimonyLineChart } from './PatrimonyLineChart'
import type { PatrimonyDataPoint } from './PatrimonyLineChart'

type AccumulatedViewProps = {
  accounts: { name: string; balance: string }[]
  patrimonyData: PatrimonyDataPoint[]
  totalBalance: string
}

function formatCurrency(value: string) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function AccumulatedView({ accounts, patrimonyData, totalBalance }: AccumulatedViewProps) {
  return (
    <div className="space-y-6" data-testid="accumulated-view">
      <Card className="overflow-hidden border-border/80 bg-background/95 p-0 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] border-l-4 border-l-emerald-500/60 bg-emerald-500/5">
        <div className="space-y-2 p-6">
          <p className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
            Patrimônio total
          </p>
          <h3 className="font-serif text-5xl tracking-tight text-foreground" data-testid="patrimony-total">
            {formatCurrency(totalBalance)}
          </h3>
          <p className="text-sm text-muted-foreground">
            Soma dos saldos de todas as contas
          </p>
        </div>
      </Card>

      <Card className="border-border/80 bg-background/95 p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.45)]">
        <div className="space-y-5">
          <div className="space-y-2 border-b border-border/80 pb-4">
            <p className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
              Evolução
            </p>
            <h2 className="font-serif text-2xl tracking-tight text-foreground">
              Patrimônio acumulado
            </h2>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Evolução mensal do patrimônio realizado e previsto.
            </p>
          </div>
          <PatrimonyLineChart data={patrimonyData} />
        </div>
      </Card>

      <Card className="border-border/80 bg-background/95 p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.45)]">
        <div className="space-y-5">
          <div className="space-y-2 border-b border-border/80 pb-4">
            <p className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
              Contas
            </p>
            <h2 className="font-serif text-2xl tracking-tight text-foreground">
              Saldos por conta
            </h2>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Posição atual de cada conta no patrimônio.
            </p>
          </div>
          <div className="space-y-3" data-testid="account-breakdown">
            {accounts.length > 0 ? (
              accounts.map((account) => (
                <div
                  key={account.name}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 p-3 shadow-sm"
                >
                  <p className="font-medium">{account.name}</p>
                  <p className="font-semibold">{formatCurrency(account.balance)}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-4 py-5">
                <p className="text-sm font-medium text-foreground">
                  Nenhuma conta cadastrada.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cadastre suas contas para acompanhar seu patrimônio.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
