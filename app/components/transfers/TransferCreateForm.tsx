'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type TransferCreateFormProps = {
  accounts: Array<{
    id: number
    name: string
  }>
}

export function TransferCreateForm({ accounts }: TransferCreateFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)

    try {
      const response = await fetch('/api/transfers', {
        method: 'POST',
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
        }),
      })

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
          <h1 className="text-3xl font-bold tracking-tight">Nova transferência</h1>
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
                defaultValue=""
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
                defaultValue=""
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
              <Input id="amount" name="amount" required step="0.01" type="number" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="description">
                Descrição
              </label>
              <Input id="description" name="description" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="competenceDate">
                Competência
              </label>
              <Input id="competenceDate" name="competenceDate" required type="date" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="dueDate">
                Vencimento
              </label>
              <Input id="dueDate" name="dueDate" required type="date" />
            </div>

            <div className="md:col-span-2">
              <Button disabled={loading} type="submit">
                {loading ? 'Salvando...' : 'Salvar transferência'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
