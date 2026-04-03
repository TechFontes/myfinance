'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SettleTransferDialog } from '@/components/transfers/SettleTransferDialog'
import { CancelConfirmDialog } from '@/components/shared/CancelConfirmDialog'

type TransferListItem = {
  id: number
  sourceAccountLabel: string
  destinationAccountLabel: string
  amount: string
  description: string | null
  competenceDate: string | Date
  dueDate: string | Date
  paidAt: string | Date | null
  status: 'PLANNED' | 'PENDING' | 'PAID' | 'CANCELED'
}

type TransfersListProps = {
  transfers: TransferListItem[]
}

const statusLabels: Record<TransferListItem['status'], string> = {
  PLANNED: 'Prevista',
  PENDING: 'Pendente',
  PAID: 'Paga',
  CANCELED: 'Cancelada',
}

function formatDate(value: string | Date | null) {
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

export function TransfersList({ transfers }: TransfersListProps) {
  if (transfers.length === 0) {
    return (
      <Card className="border-dashed p-6 text-sm text-muted-foreground">
        Nenhuma movimentação interna encontrada para este período.
      </Card>
    )
  }

  return (
    <div data-testid="transfers-list" className="space-y-4">
      {transfers.map((transfer) => (
        <Card key={transfer.id} className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Movimentação interna
              </div>
              <div className="text-lg font-semibold">{transfer.description ?? 'Transferência interna'}</div>
              <div className="text-sm text-muted-foreground">
                {transfer.sourceAccountLabel} para {transfer.destinationAccountLabel}
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold">{formatCurrency(transfer.amount)}</div>
              <div className="text-sm text-muted-foreground">{statusLabels[transfer.status]}</div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
            <div>
              <div className="font-medium text-foreground">Competência</div>
              <div>{formatDate(transfer.competenceDate)}</div>
            </div>
            <div>
              <div className="font-medium text-foreground">Vencimento</div>
              <div>{formatDate(transfer.dueDate)}</div>
            </div>
            <div>
              <div className="font-medium text-foreground">Pagamento</div>
              <div>{formatDate(transfer.paidAt)}</div>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Link
              className="inline-flex items-center rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              href={`/dashboard/transfers/${transfer.id}`}
            >
              Editar
            </Link>
            {(transfer.status === 'PLANNED' || transfer.status === 'PENDING') && (
              <SettleTransferDialog
                transferId={transfer.id}
                trigger={
                  <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-300 hover:bg-emerald-50">
                    Liquidar
                  </Button>
                }
              />
            )}
            {transfer.status !== 'CANCELED' && (
              <CancelConfirmDialog
                entityType="transfer"
                entityId={transfer.id}
                entityDescription={transfer.description ?? 'Transferência interna'}
                trigger={
                  <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive">
                    Cancelar
                  </Button>
                }
              />
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
