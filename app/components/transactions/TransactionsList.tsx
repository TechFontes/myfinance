import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type TransactionsListItem = {
  id: number
  description: string
  type: 'INCOME' | 'EXPENSE'
  value: string
  status: 'PLANNED' | 'PENDING' | 'PAID' | 'CANCELED'
  competenceDate: Date | string
  dueDate: Date | string
  paidAt?: Date | string | null
  creditCardId?: number | null
  category?: { name: string | null } | null
}

type TransactionsListProps = {
  transactions: TransactionsListItem[]
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleDateString('pt-BR')
}

function formatCurrency(value: string) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function statusLabel(status: TransactionsListItem['status']) {
  const labels = {
    PLANNED: 'Prevista',
    PENDING: 'Pendente',
    PAID: 'Paga',
    CANCELED: 'Cancelada',
  } as const

  return labels[status]
}

function statusClass(status: TransactionsListItem['status']) {
  if (status === 'PAID') {
    return 'bg-emerald-500 text-white'
  }

  if (status === 'CANCELED') {
    return 'bg-stone-500 text-white'
  }

  return 'bg-slate-900 text-white'
}

function typeLabel(type: TransactionsListItem['type']) {
  return type === 'INCOME' ? 'Receita' : 'Despesa'
}

function canRegisterPayment(transaction: TransactionsListItem) {
  return (
    (transaction.status === 'PLANNED' || transaction.status === 'PENDING') &&
    transaction.creditCardId == null
  )
}

export function TransactionsList({ transactions }: TransactionsListProps) {
  return (
    <div className="space-y-4">
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-5">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Buscar</label>
            <Input placeholder="Descrição ou categoria" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="INCOME">Receitas</SelectItem>
                <SelectItem value="EXPENSE">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PLANNED">Previstas</SelectItem>
                <SelectItem value="PENDING">Pendentes</SelectItem>
                <SelectItem value="PAID">Pagas</SelectItem>
                <SelectItem value="CANCELED">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Período</label>
            <Input type="month" />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="p-3 text-left font-medium">Descrição</th>
                <th className="p-3 text-left font-medium">Categoria</th>
                <th className="p-3 text-left font-medium">Tipo</th>
                <th className="p-3 text-left font-medium">Valor</th>
                <th className="p-3 text-left font-medium">Competência</th>
                <th className="p-3 text-left font-medium">Vencimento</th>
                <th className="p-3 text-left font-medium">Pagamento</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={9}>
                    Nenhuma transação encontrada.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 font-medium">{transaction.description}</td>
                    <td className="p-3">{transaction.category?.name ?? '—'}</td>
                    <td className="p-3">
                      <Badge variant="outline">{typeLabel(transaction.type)}</Badge>
                    </td>
                    <td className="p-3 font-semibold">{formatCurrency(transaction.value)}</td>
                    <td className="p-3">{formatDate(transaction.competenceDate)}</td>
                    <td className="p-3">{formatDate(transaction.dueDate)}</td>
                    <td className="p-3">{formatDate(transaction.paidAt)}</td>
                    <td className="p-3">
                      <Badge className={statusClass(transaction.status)}>
                        {statusLabel(transaction.status)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          className="inline-flex items-center rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                          href={`/dashboard/transactions/${transaction.id}`}
                        >
                          Editar
                        </Link>
                        {canRegisterPayment(transaction) ? (
                          <Link
                            className="inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-800 transition-colors hover:bg-emerald-500/15"
                            href={`/dashboard/transactions/${transaction.id}?action=pay`}
                          >
                            Informar pagamento
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
