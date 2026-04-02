import { Card } from '@/components/ui/card'
import type { DashboardSummary } from '@/modules/dashboard'

type DashboardSummaryChartProps = {
  summary: DashboardSummary
}

function formatCurrency(value: string) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function toAmount(value: string) {
  return Math.abs(Number(value))
}

export function DashboardSummaryChart({ summary }: DashboardSummaryChartProps) {
  const rows = [
    {
      key: 'income',
      label: 'Receitas',
      forecast: summary.forecastIncome,
      realized: summary.realizedIncome,
      forecastBarClassName: 'bg-emerald-500/55',
      realizedBarClassName: 'bg-emerald-700 dark:bg-emerald-300',
    },
    {
      key: 'expense',
      label: 'Despesas',
      forecast: summary.forecastExpense,
      realized: summary.realizedExpense,
      forecastBarClassName: 'bg-rose-500/55',
      realizedBarClassName: 'bg-rose-700 dark:bg-rose-300',
    },
    {
      key: 'balance',
      label: 'Saldo',
      forecast: summary.forecastBalance,
      realized: summary.realizedBalance,
      forecastBarClassName: 'bg-foreground/35',
      realizedBarClassName: 'bg-foreground dark:bg-foreground',
    },
  ] as const

  const maxValue = Math.max(
    ...rows.flatMap((row) => [toAmount(row.forecast), toAmount(row.realized)]),
    1,
  )

  return (
    <Card className="border-border/80 bg-background/95 p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.45)]">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">Comparativo</p>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Projetado vs realizado
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-foreground/35" aria-hidden="true" />
              Projetado
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-foreground" aria-hidden="true" />
              Realizado
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {rows.map((row) => {
            const forecastWidth = `${(toAmount(row.forecast) / maxValue) * 100}%`
            const realizedWidth = `${(toAmount(row.realized) / maxValue) * 100}%`

            return (
              <div
                key={row.key}
                aria-label={`${row.label}: projetado ${formatCurrency(row.forecast)}, realizado ${formatCurrency(row.realized)}`}
                className="space-y-2"
                data-testid="dashboard-summary-chart-group"
                role="img"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-foreground">{row.label}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatCurrency(row.forecast)}</span>
                    <span className="font-medium text-foreground">{formatCurrency(row.realized)}</span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted/60">
                    <div
                      aria-label={`${row.label} projetadas: ${formatCurrency(row.forecast)}`.replace(
                        'Despesas projetadas',
                        'Despesas projetadas',
                      ).replace('Saldo projetadas', 'Saldo projetado').replace('Receitas projetadas', 'Receitas projetadas')}
                      className={`h-full rounded-full ${row.forecastBarClassName}`}
                      data-testid={`dashboard-summary-chart-forecast-${row.key}`}
                      style={{ width: forecastWidth }}
                    />
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted/60">
                    <div
                      aria-label={`${row.label} realizadas: ${formatCurrency(row.realized)}`.replace(
                        'Despesas realizadas',
                        'Despesas realizadas',
                      ).replace('Saldo realizadas', 'Saldo realizado').replace('Receitas realizadas', 'Receitas realizadas')}
                      className={`h-full rounded-full ${row.realizedBarClassName}`}
                      data-testid={`dashboard-summary-chart-realized-${row.key}`}
                      style={{ width: realizedWidth }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
