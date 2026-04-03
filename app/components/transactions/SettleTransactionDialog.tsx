'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

type SettleTransactionDialogProps = {
  transactionId: number
  accounts: { id: number; name: string }[]
  trigger: React.ReactNode
  onSuccess?: () => void
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function SettleTransactionDialog({
  transactionId,
  accounts,
  trigger,
  onSuccess,
}: SettleTransactionDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [accountId, setAccountId] = useState<number | null>(null)
  const [paidAt, setPaidAt] = useState(todayISO())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!accountId) {
      setError('Selecione uma conta')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/transactions/${transactionId}/settle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, paidAt }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Erro ao liquidar transação')
      }

      setOpen(false)
      onSuccess?.()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao liquidar transação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Liquidar transação</DialogTitle>
          <DialogDescription>
            Selecione a conta e data de pagamento
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="account">Conta</Label>
            <Select
              onValueChange={(value) => setAccountId(Number(value))}
            >
              <SelectTrigger id="account">
                <SelectValue placeholder="Selecione a conta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={String(account.id)}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="paidAt">Data de pagamento</Label>
            <Input
              id="paidAt"
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Liquidando...' : 'Liquidar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
