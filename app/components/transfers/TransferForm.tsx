'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type TransferFormAccount = {
  id: number
  name: string
}

type TransferFormInitialValues = {
  id: number
  sourceAccountId: number
  destinationAccountId: number
  amount: string
  description: string | null
  competenceDate: string | Date
  dueDate: string | Date
  paidAt: string | Date | null
  status: 'PLANNED' | 'PENDING' | 'PAID' | 'CANCELED'
}

type TransferFormProps = {
  accounts: TransferFormAccount[]
  mode: 'create' | 'edit'
  initialValues?: TransferFormInitialValues
}

function formatDateInput(value: string | Date | null | undefined) {
  if (!value) {
    return ''
  }

  if (typeof value === 'string') {
    return value.slice(0, 10)
  }

  return value.toISOString().slice(0, 10)
}

export function TransferForm({ accounts, mode, initialValues }: TransferFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEditMode = mode === 'edit'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)

    try {
      const response = await fetch(
        isEditMode ? `/api/transfers/${initialValues?.id}` : '/api/transfers',
        {
          method: isEditMode ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourceAccountId: Number(formData.get('sourceAccountId')),
            destinationAccountId: Number(formData.get('destinationAccountId')),
            amount: String(formData.get('amount') ?? ''),
            description: String(formData.get('description') ?? ''),
            competenceDate: String(formData.get('competenceDate') ?? ''),
            dueDate: String(formData.get('dueDate') ?? ''),
            ...(isEditMode
              ? {
                  status: String(formData.get('status') ?? ''),
                  paidAt: String(formData.get('paidAt') ?? ''),
                }
              : {}),
          }),
        },
      )

      if (!response.ok) {
        throw new Error('Falha ao salvar transferência')
      }

      router.push('/dashboard/transfers')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? 'Editar transferência' : 'Nova transferência'}
          </h1>
          <p className="text-muted-foreground">
            Registre uma movimentação interna entre contas do mesmo patrimônio.
          </p>
        </div>

        <Button variant="ghost" onClick={() => router.back()} type="button">
          Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados da transferência</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="sourceAccountId">
                Conta de origem
              </label>
              <select
                className="flex h-9 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground shadow-sm"
                defaultValue={initialValues ? String(initialValues.sourceAccountId) : ''}
                id="sourceAccountId"
                name="sourceAccountId"
                required
              >
                <option disabled value="">
                  Selecione uma conta
                </option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="destinationAccountId">
                Conta de destino
              </label>
              <select
                className="flex h-9 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground shadow-sm"
                defaultValue={initialValues ? String(initialValues.destinationAccountId) : ''}
                id="destinationAccountId"
                name="destinationAccountId"
                required
              >
                <option disabled value="">
                  Selecione uma conta
                </option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="amount">
                Valor
              </label>
              <Input
                defaultValue={initialValues?.amount ?? ''}
                id="amount"
                name="amount"
                required
                step="0.01"
                type="number"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="description">
                Descrição
              </label>
              <Input
                defaultValue={initialValues?.description ?? ''}
                id="description"
                name="description"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="competenceDate">
                Competência
              </label>
              <Input
                defaultValue={formatDateInput(initialValues?.competenceDate)}
                id="competenceDate"
                name="competenceDate"
                required
                type="date"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="dueDate">
                Vencimento
              </label>
              <Input
                defaultValue={formatDateInput(initialValues?.dueDate)}
                id="dueDate"
                name="dueDate"
                required
                type="date"
              />
            </div>

            {isEditMode ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="status">
                    Status
                  </label>
                  <select
                    className="flex h-9 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground shadow-sm"
                    defaultValue={initialValues?.status ?? 'PLANNED'}
                    id="status"
                    name="status"
                    required
                  >
                    <option value="PLANNED">Prevista</option>
                    <option value="PENDING">Pendente</option>
                    <option value="PAID">Paga</option>
                    <option value="CANCELED">Cancelada</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="paidAt">
                    Pagamento
                  </label>
                  <Input
                    defaultValue={formatDateInput(initialValues?.paidAt)}
                    id="paidAt"
                    name="paidAt"
                    type="date"
                  />
                </div>
              </>
            ) : null}

            <div className="md:col-span-2">
              <Button disabled={loading} type="submit">
                {loading
                  ? 'Salvando...'
                  : isEditMode
                    ? 'Salvar alterações'
                    : 'Salvar transferência'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
