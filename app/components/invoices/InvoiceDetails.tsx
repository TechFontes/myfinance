import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PayInvoiceDialog } from '@/components/invoices/PayInvoiceDialog'

export type InvoiceDetailsTransaction = {
  id: number
  description: string
  value: string
  status: 'OPEN' | 'PAID' | 'CANCELED' | 'PLANNED' | 'PENDING'
  competenceDate: Date | string
  dueDate: Date | string
  paidAt?: Date | string | null
  installmentGroupId?: string | null
  installment?: number | null
  installments?: number | null
}

export type InvoiceDetailsData = {
  id: number
  month: number
  year: number
  status: 'OPEN' | 'PAID' | 'CANCELED'
  total: string
  dueDate: Date | string
  creditCard: {
    id: number
    name: string
    closeDay: number
    dueDay: number
    color?: string | null
    icon?: string | null
  }
  transactions: InvoiceDetailsTransaction[]
}

type InvoiceDetailsProps = {
  invoice: InvoiceDetailsData
  accounts?: { id: number; name: string }[]
  categories?: { id: number; name: string }[]
}

function formatCurrency(value: string) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleDateString('pt-BR', {
    timeZone: 'UTC',
  })
}

function statusLabel(status: InvoiceDetailsData['status']) {
  const labels = {
    OPEN: 'Aberta',
    PAID: 'Paga',
    CANCELED: 'Cancelada',
  } as const

  return labels[status]
}

function transactionStatusLabel(status: InvoiceDetailsTransaction['status']) {
  const labels = {
    OPEN: 'Aberta',
    PAID: 'Paga',
    CANCELED: 'Cancelada',
    PLANNED: 'Prevista',
    PENDING: 'Pendente',
  } as const

  return labels[status]
}

function statusClass(status: InvoiceDetailsData['status']) {
  if (status === 'PAID') {
    return 'bg-emerald-500 text-white'
  }

  if (status === 'CANCELED') {
    return 'bg-stone-500 text-white'
  }

  return 'bg-slate-900 text-white'
}

export function InvoiceDetails({ invoice, accounts = [], categories = [] }: InvoiceDetailsProps) {
  const competenceLabel = `${String(invoice.month).padStart(2, '0')}/${invoice.year}`

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Fatura #{invoice.id}</h1>
          <p className="text-muted-foreground">
            Acompanhe a fatura do cartão e os lançamentos já consolidados no ciclo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={statusClass(invoice.status)}>{statusLabel(invoice.status)}</Badge>
          {invoice.status === 'OPEN' && (
            <PayInvoiceDialog
              invoiceId={invoice.id}
              accounts={accounts}
              categories={categories}
              trigger={
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Pagar Fatura
                </Button>
              }
            />
          )}
        </div>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Resumo da fatura</CardTitle>
          <CardDescription>
            O pagamento desta fatura quita a obrigação do cartão e compras já registradas, sem criar uma nova despesa principal.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Cartão</div>
            <div className="font-medium">Cartão {invoice.creditCard.name}</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-xl font-semibold">{formatCurrency(invoice.total)}</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Competência</div>
            <div className="font-medium">{competenceLabel}</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Vencimento</div>
            <div className="font-medium">{formatDate(invoice.dueDate)}</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Ciclo</div>
            <div className="font-medium">
              Fechamento dia {invoice.creditCard.closeDay} e vencimento dia {invoice.creditCard.dueDay}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lançamentos vinculados</CardTitle>
          <CardDescription>
            Compras e parcelas que compõem esta fatura.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {invoice.transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum lançamento vinculado a esta fatura.</p>
          ) : (
            invoice.transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="rounded-lg border border-slate-200 p-4 shadow-sm dark:border-slate-800"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-base font-semibold">{transaction.description}</div>
                      <Badge variant="outline">{transactionStatusLabel(transaction.status)}</Badge>
                      {transaction.installmentGroupId ? (
                        <Badge variant="secondary">Parcela vinculada</Badge>
                      ) : null}
                    </div>

                    <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                      <div>Competência: {formatDate(transaction.competenceDate)}</div>
                      <div>Vencimento: {formatDate(transaction.dueDate)}</div>
                      <div>Pagamento: {formatDate(transaction.paidAt)}</div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {transaction.installment && transaction.installments
                        ? `Parcela ${transaction.installment} de ${transaction.installments}`
                        : 'Compra sem parcelamento'}
                    </div>
                  </div>

                  <div className="text-lg font-semibold">{formatCurrency(transaction.value)}</div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
