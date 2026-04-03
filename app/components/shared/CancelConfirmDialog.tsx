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

type CancelConfirmDialogProps = {
  entityType: 'transaction' | 'transfer'
  entityId: number
  entityDescription: string
  trigger: React.ReactNode
  onSuccess?: () => void
}

const entityLabels = {
  transaction: 'transação',
  transfer: 'transferência',
} as const

const entityEndpoints = {
  transaction: 'transactions',
  transfer: 'transfers',
} as const

export function CancelConfirmDialog({
  entityType,
  entityId,
  entityDescription,
  trigger,
  onSuccess,
}: CancelConfirmDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const label = entityLabels[entityType]

  async function handleCancel() {
    setLoading(true)
    setError(null)

    try {
      const endpoint = `/api/${entityEndpoints[entityType]}/${entityId}/cancel`
      const response = await fetch(endpoint, { method: 'PATCH' })

      if (!response.ok) {
        throw new Error(`Erro ao cancelar ${label}`)
      }

      setOpen(false)
      onSuccess?.()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Erro ao cancelar ${label}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar {label}</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja cancelar &apos;{entityDescription}&apos;? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Voltar
          </Button>
          <Button variant="destructive" onClick={handleCancel} disabled={loading}>
            {loading ? 'Cancelando...' : 'Cancelar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
