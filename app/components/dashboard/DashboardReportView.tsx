import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { DashboardPeriod, DashboardReport } from '@/modules/dashboard'

type DashboardReportViewProps = {
  report: DashboardReport
  availableMonths: string[]
}

function formatCurrency(value: string) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

function formatMonthLabel(month: string) {
  const [year, monthIndex] = month.split('-')
  const date = new Date(Number(year), Number(monthIndex) - 1)

  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function SummaryCard({
  title,
  income,
  expense,
  balance,
}: {
  title: string
  income: string
  expense: string
  balance: string
}) {
  return (
    <Card className="p-5">
      <div className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-semibold">{formatCurrency(balance)}</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-muted-foreground">Receitas</p>
            <p className="font-semibold text-emerald-600">{formatCurrency(income)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-muted-foreground">Despesas</p>
            <p className="font-semibold text-rose-600">{formatCurrency(expense)}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
      <h2 className="text-xl font-semibold">{title}</h2>
      {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
    </div>
  )
}

export function DashboardReportView({ report, availableMonths }: DashboardReportViewProps) {
  const months = availableMonths.includes(report.period.month)
    ? availableMonths
    : [report.period.month, ...availableMonths]

  return (
    <div className="space-y-8">
      <header className="space-y-5 rounded-3xl border bg-gradient-to-br from-background to-muted/30 p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Dashboard mensal
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Visão geral</h1>
          <p className="max-w-2xl text-muted-foreground">
            Sua situação financeira consolidada do período selecionado.
          </p>
        </div>

        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" method="get">
          <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="month">
            Período
            <select
              id="month"
              name="month"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              defaultValue={report.period.month}
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {formatMonthLabel(month)}
                </option>
              ))}
            </select>
          </label>

          <button
            className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            type="submit"
          >
            Ver período
          </button>
        </form>

        <div className="text-sm text-muted-foreground">
          Período atual: <span className="font-medium text-foreground">{report.period.label}</span>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <SummaryCard
          title="Saldo previsto"
          income={report.summary.forecastIncome}
          expense={report.summary.forecastExpense}
          balance={report.summary.forecastBalance}
        />
        <SummaryCard
          title="Saldo realizado"
          income={report.summary.realizedIncome}
          expense={report.summary.realizedExpense}
          balance={report.summary.realizedBalance}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <div className="space-y-4">
            <SectionTitle
              eyebrow="Pendências"
              title="Itens a vencer"
              subtitle="Lançamentos previstos e pendentes do período."
            />
            <div className="space-y-3">
              {report.pending.length > 0 ? (
                report.pending.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border bg-background/80 p-3"
                  >
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Vence em {formatDate(item.dueDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.amount)}</p>
                      <Badge variant="outline">{item.status}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma pendência neste período.</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="space-y-4">
            <SectionTitle
              eyebrow="Contas"
              title="Saldos por conta"
              subtitle="Posição consolidada de caixa no período."
            />
            <div className="space-y-3">
              {report.accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-xl border bg-background/80 p-3"
                >
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {account.type} {account.active ? 'Ativa' : 'Inativa'}
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(account.balance)}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-1">
          <div className="space-y-4">
            <SectionTitle
              eyebrow="Categorias"
              title="Totais por categoria"
              subtitle="Categorias com maior impacto no período."
            />
            <div className="space-y-3">
              {report.categories.map((category) => (
                <div
                  key={category.categoryId}
                  className="flex items-center justify-between rounded-xl border bg-background/80 p-3"
                >
                  <div>
                    <p className="font-medium">{category.categoryName}</p>
                    <p className="text-sm text-muted-foreground">{category.type}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(category.total)}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-5 xl:col-span-1">
          <div className="space-y-4">
            <SectionTitle
              eyebrow="Cartões"
              title="Cartões e faturas"
              subtitle="Resumo das faturas em aberto, pagas ou canceladas."
            />
            <div className="space-y-3">
              {report.cardInvoices.map((invoice) => (
                <div
                  key={invoice.invoiceId}
                  className="flex items-center justify-between rounded-xl border bg-background/80 p-3"
                >
                  <div>
                    <p className="font-medium">{invoice.cardName}</p>
                    <p className="text-sm text-muted-foreground">
                      {String(invoice.month).padStart(2, '0')}/{invoice.year} {invoice.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(invoice.total)}</p>
                    <p className="text-sm text-muted-foreground">
                      Vence em {formatDate(invoice.dueDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-5 xl:col-span-1">
          <div className="space-y-4">
            <SectionTitle
              eyebrow="Movimentações internas"
              title="Transferências"
              subtitle="Movimentos entre contas, separados de receitas e despesas."
            />
            <div className="space-y-3">
              {report.transfers.map((transfer) => (
                <div
                  key={transfer.transferId}
                  className="rounded-xl border bg-background/80 p-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{transfer.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {transfer.sourceAccountName} → {transfer.destinationAccountName}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(transfer.amount)}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                    <span>{transfer.status}</span>
                    <span>{formatDate(transfer.competenceDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}
