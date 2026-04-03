import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { DashboardReport } from '@/modules/dashboard'
import { DashboardPeriodNavigator } from '@/components/dashboard/DashboardPeriodNavigator'
import { DashboardSummaryChart } from '@/components/dashboard/DashboardSummaryChart'
import { AccumulatedView } from '@/components/dashboard/AccumulatedView'
import type { PatrimonyDataPoint } from '@/components/dashboard/PatrimonyLineChart'

type AccumulatedData = {
  patrimonyData: PatrimonyDataPoint[]
  accounts: { name: string; balance: string }[]
  totalBalance: string
}

type DashboardReportViewProps = {
  report: DashboardReport
  availableMonths: string[]
  selectedView?: 'general' | 'receivable' | 'payable' | 'consolidated' | 'accumulated'
  accumulatedData?: AccumulatedData
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

function getCategoryTypeLabel(type: string) {
  return type === 'INCOME' ? 'Receita' : 'Despesa'
}

function getAccountTypeLabel(type: string) {
  switch (type) {
    case 'BANK': return 'Banco'
    case 'WALLET': return 'Carteira'
    default: return 'Outro'
  }
}

function SummaryCard({
  title,
  eyebrow,
  accentClassName,
  income,
  expense,
  balance,
}: {
  title: string
  eyebrow: string
  accentClassName: string
  income: string
  expense: string
  balance: string
}) {
  return (
    <Card className={`overflow-hidden border-border/80 bg-background/95 p-0 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] border-l-4 ${accentClassName.includes('emerald') ? 'border-l-emerald-500/60 bg-emerald-500/5' : 'border-l-foreground/60 bg-foreground/5'}`}>
      <div className={accentClassName} aria-hidden="true" />
      <div className="max-h-[450px] space-y-3 p-4">
        <div className="space-y-1.5">
          <p className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">{eyebrow}</p>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="font-serif text-3xl tracking-tight text-foreground">{formatCurrency(balance)}</h3>
          <p className="text-sm text-muted-foreground">Posição patrimonial do período</p>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-500/35 bg-emerald-500/12 p-3">
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-900 dark:text-emerald-300">
              Receitas
            </p>
            <p className="mt-1.5 text-lg font-semibold text-emerald-950 dark:text-emerald-200">
              {formatCurrency(income)}
            </p>
          </div>
          <div className="rounded-2xl border border-rose-500/35 bg-rose-500/12 p-3">
            <p className="text-xs uppercase tracking-[0.24em] text-rose-900 dark:text-rose-300">
              Despesas
            </p>
            <p className="mt-1.5 text-lg font-semibold text-rose-950 dark:text-rose-200">
              {formatCurrency(expense)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

function SectionPanel({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string
  title: string
  subtitle: string
  children: React.ReactNode
  }) {
  return (
    <Card className="border-border/80 bg-background/95 p-4 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.45)]">
      <div className="space-y-3">
        <div className="space-y-1.5 border-b border-border/80 pb-3">
          <p className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">{eyebrow}</p>
          <h2 className="font-serif text-2xl tracking-tight text-foreground">{title}</h2>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </div>
    </Card>
  )
}

function EmptySectionState({
  children,
  support,
}: {
  children: React.ReactNode
  support: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-4 py-5">
      <p className="text-sm font-medium text-foreground">{children}</p>
      <p className="mt-1 text-sm text-muted-foreground">{support}</p>
    </div>
  )
}

const dashboardViews = [
  { key: 'general', label: 'Geral' },
  { key: 'receivable', label: 'A receber' },
  { key: 'payable', label: 'A pagar' },
  { key: 'consolidated', label: 'Consolidados' },
  { key: 'accumulated', label: 'Acumulado' },
] as const

function buildViewHref(view: (typeof dashboardViews)[number]['key'], month: string) {
  return `/dashboard?view=${view}&month=${month}`
}

export function DashboardReportView({
  report,
  availableMonths,
  selectedView = 'general',
  accumulatedData,
}: DashboardReportViewProps) {
  const incomeCategories = report.categories.filter((category) => category.type === 'INCOME')
  const expenseCategories = report.categories.filter((category) => category.type === 'EXPENSE')
  const visiblePending = selectedView === 'receivable' ? [] : report.pending
  const showSummaryCards = selectedView !== 'consolidated'
  const showChart = selectedView === 'general'
  const showPending = selectedView === 'general' || selectedView === 'payable'
  const showAccounts = selectedView === 'general' || selectedView === 'receivable' || selectedView === 'consolidated'
  const visibleCategories =
    selectedView === 'receivable'
      ? incomeCategories
      : selectedView === 'payable'
        ? expenseCategories
        : report.categories
  const showCategories = selectedView !== 'general' || visibleCategories.length > 0
  const showCardInvoices = selectedView === 'general' || selectedView === 'payable' || selectedView === 'consolidated'
  const showTransfers = selectedView === 'general' || selectedView === 'consolidated'

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-[2rem] border border-border/80 bg-background/95 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] ring-1 ring-border/40">
        <div className="grid gap-4 px-6 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-8 lg:py-6">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.38em] text-muted-foreground">
              Dashboard mensal
            </p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Visão geral</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Sua situação financeira consolidada do período selecionado.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/transactions/new"
              className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
            >
              Nova transação
            </Link>
            <div className="rounded-full border border-border/70 bg-background px-4 py-2 text-sm text-muted-foreground">
              Período atual:{' '}
              <span className="font-medium text-foreground">{report.period.label}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border/80 bg-muted/30 px-6 py-4 lg:px-8">
          <p className="mb-3 text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
            Períodos disponíveis
          </p>
          <DashboardPeriodNavigator
            availableMonths={availableMonths}
            selectedPeriod={report.period}
          />
        </div>

        <div className="border-t border-border/80 bg-background/70 px-6 py-3 lg:px-8">
          <nav aria-label="Visualizações do dashboard" className="flex flex-wrap items-center gap-2">
            {dashboardViews.map((view) => {
              const isActive = view.key === selectedView

              return (
                <Link
                  key={view.key}
                  href={buildViewHref(view.key, report.period.month)}
                  aria-current={isActive ? 'page' : undefined}
                  className={[
                    'inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-foreground text-background'
                      : 'border border-border/70 text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  ].join(' ')}
                >
                  {view.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {selectedView === 'accumulated' && accumulatedData ? (
        <AccumulatedView
          accounts={accumulatedData.accounts}
          patrimonyData={accumulatedData.patrimonyData}
          totalBalance={accumulatedData.totalBalance}
        />
      ) : null}

      {selectedView !== 'accumulated' && showSummaryCards ? (
        <section className="grid gap-3 lg:grid-cols-2" aria-label="Resumo patrimonial">
          <p className="col-span-full text-[11px] uppercase tracking-[0.34em] text-muted-foreground">Resumo patrimonial</p>
          <SummaryCard
            title="Saldo previsto"
            eyebrow="Projeção"
            accentClassName="h-1.5 rounded-t-xl w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300"
            income={report.summary.forecastIncome}
            expense={report.summary.forecastExpense}
            balance={report.summary.forecastBalance}
          />
          <SummaryCard
            title="Saldo realizado"
            eyebrow="Realizado"
            accentClassName="h-1.5 rounded-t-xl w-full bg-gradient-to-r from-foreground via-foreground/85 to-foreground/65"
            income={report.summary.realizedIncome}
            expense={report.summary.realizedExpense}
            balance={report.summary.realizedBalance}
          />
        </section>
      ) : null}

      {selectedView !== 'accumulated' && showChart ? <DashboardSummaryChart summary={report.summary} /> : null}

      {selectedView !== 'accumulated' ? <section className="grid gap-3 xl:grid-cols-2 border-t border-border/60 pt-4">
        {showPending ? (
          <SectionPanel
            eyebrow="Pendências"
            title={selectedView === 'payable' ? 'Saídas e obrigações' : 'Itens a vencer'}
            subtitle="Lançamentos previstos e pendentes do período."
          >
            <div className="space-y-2">
              {visiblePending.length > 0 ? (
                visiblePending.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 p-2.5 shadow-sm"
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
                <EmptySectionState
                  support="Quando houver lançamentos previstos, este painel destacará vencimentos e valores com leitura patrimonial."
                >
                  Nenhuma pendência neste período. Todas as obrigações foram liquidadas.
                </EmptySectionState>
              )}
            </div>
          </SectionPanel>
        ) : null}

        {showAccounts ? (
          <SectionPanel
            eyebrow="Contas"
            title="Saldos por conta"
            subtitle="Posição consolidada de caixa no período."
          >
            <div className="space-y-2">
              {report.accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 p-2.5 shadow-sm"
                >
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {getAccountTypeLabel(account.type)} {account.active ? 'Ativa' : 'Inativa'}
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(account.balance)}</p>
                </div>
              ))}
              {report.accounts.length === 0 ? (
                <EmptySectionState
                  support="Cadastre suas contas para acompanhar seu patrimônio."
                >
                  Nenhuma conta cadastrada. Cadastre suas contas para acompanhar seu patrimônio.
                </EmptySectionState>
              ) : null}
            </div>
          </SectionPanel>
        ) : null}
      </section> : null}

      {selectedView !== 'accumulated' ? <section className="grid gap-3 xl:grid-cols-3 border-t border-border/40 pt-4 opacity-95">
        {showCategories ? (
          <SectionPanel
            eyebrow="Categorias"
            title={selectedView === 'receivable' ? 'Entradas por categoria' : selectedView === 'payable' ? 'Saídas por categoria' : 'Totais por categoria'}
            subtitle="Categorias com maior impacto no período."
          >
            <div className="space-y-2">
              {visibleCategories.map((category) => (
                <div
                  key={category.categoryId}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 p-2.5 shadow-sm"
                >
                  <div>
                    <p className="font-medium">{category.categoryName}</p>
                    <p className="text-sm text-muted-foreground">{getCategoryTypeLabel(category.type)}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(category.total)}</p>
                </div>
              ))}
              {visibleCategories.length === 0 ? (
                <EmptySectionState
                  support="Quando houver categorias movimentadas, este painel destacará seus impactos e pesos no período."
                >
                  Nenhuma movimentação por categoria neste período.
                </EmptySectionState>
              ) : null}
            </div>
          </SectionPanel>
        ) : null}

        {showCardInvoices ? (
          <SectionPanel
            eyebrow="Cartões"
            title="Cartões e faturas"
            subtitle="Resumo das faturas em aberto, pagas ou canceladas."
          >
            <div className="space-y-2">
              {report.cardInvoices.map((invoice) => (
                <div
                  key={invoice.invoiceId}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 p-2.5 shadow-sm"
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
              {report.cardInvoices.length === 0 ? (
                <EmptySectionState
                  support="Quando houver faturas em aberto, este painel destacará cartão, vencimento e valor consolidado."
                >
                  Nenhuma fatura de cartão neste período.
                </EmptySectionState>
              ) : null}
            </div>
          </SectionPanel>
        ) : null}

        {showTransfers ? (
          <SectionPanel
            eyebrow="Movimentações internas"
            title="Transferências"
            subtitle="Movimentos entre contas, separados de receitas e despesas."
          >
            <div className="space-y-2">
              {report.transfers.map((transfer) => (
                <div
                  key={transfer.transferId}
                  className="rounded-xl border border-border/70 bg-muted/30 p-2.5 shadow-sm"
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
              {report.transfers.length === 0 ? (
                <EmptySectionState
                  support="Quando houver transferências internas, este painel destacará origem, destino e data de competência."
                >
                  Nenhuma movimentação interna neste período.
                </EmptySectionState>
              ) : null}
            </div>
          </SectionPanel>
        ) : null}
      </section> : null}
    </div>
  )
}
