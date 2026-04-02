'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type GoalMovementAction = 'contribute' | 'withdraw' | 'adjust'

type GoalMovementFormProps = {
  goalId: number
  goalName: string
  reserveAccountId: number | null
  action: GoalMovementAction
  accounts: Array<{
    id: number
    name: string
  }>
  onSuccess?: () => void
}

function getDefaultDate() {
  return new Date().toISOString().slice(0, 10)
}

function getActionCopy(action: GoalMovementAction) {
  if (action === 'withdraw') {
    return {
      title: 'Resgatar da meta',
      submitLabel: 'Confirmar resgate',
      kind: 'WITHDRAWAL' as const,
      counterpartLabel: 'Conta de destino',
    }
  }

  if (action === 'adjust') {
    return {
      title: 'Ajustar progresso da meta',
      submitLabel: 'Salvar ajuste',
      kind: 'ADJUSTMENT' as const,
      counterpartLabel: 'Conta',
    }
  }

  return {
    title: 'Aportar na meta',
    submitLabel: 'Confirmar aporte',
    kind: 'CONTRIBUTION' as const,
    counterpartLabel: 'Conta de origem',
  }
}

export function GoalMovementForm({
  goalId,
  goalName,
  reserveAccountId,
  action,
  accounts,
  onSuccess,
}: GoalMovementFormProps) {
  const router = useRouter()
  const copy = getActionCopy(action)
  const initialMode =
    action === 'withdraw' && reserveAccountId != null ? 'TRANSFER_FROM_RESERVE' : 'INFORMATION_ONLY'
  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState<'INFORMATION_ONLY' | 'TRANSFER_TO_RESERVE' | 'TRANSFER_FROM_RESERVE'>(
    initialMode,
  )
  const [counterpartAccountId, setCounterpartAccountId] = useState('')
  const [movementDate, setMovementDate] = useState(getDefaultDate())
  const [note, setNote] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supportsFinancialReflection = action !== 'adjust' && reserveAccountId != null
  const counterpartAccounts = useMemo(
    () => accounts.filter((account) => account.id !== reserveAccountId),
    [accounts, reserveAccountId],
  )

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    const payload: Record<string, string | number | null> = {
      amount,
      kind: copy.kind,
      mode,
      movementDate,
      note: note.trim() || null,
    }

    if (mode !== 'INFORMATION_ONLY' && counterpartAccountId) {
      payload.counterpartAccountId = Number(counterpartAccountId)
    }

    try {
      const response = await fetch(`/api/goals/${goalId}/contributions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? 'Não foi possível registrar o movimento da meta.')
      }

      onSuccess?.()
      router.refresh()
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Não foi possível registrar o movimento da meta.',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="border-dashed bg-background/80 p-4">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <h3 className="font-medium text-foreground">{copy.title}</h3>
          <p className="text-sm text-muted-foreground">{goalName}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`goal-movement-amount-${goalId}`}>Valor</Label>
            <Input
              id={`goal-movement-amount-${goalId}`}
              inputMode="decimal"
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              required
              value={amount}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`goal-movement-date-${goalId}`}>Data do movimento</Label>
            <Input
              id={`goal-movement-date-${goalId}`}
              onChange={(event) => setMovementDate(event.target.value)}
              required
              type="date"
              value={movementDate}
            />
          </div>
        </div>

        {action !== 'adjust' ? (
          <div className="space-y-2">
            <Label htmlFor={`goal-movement-mode-${goalId}`}>Como registrar</Label>
            <Select
              onValueChange={(value) =>
                setMode(value as 'INFORMATION_ONLY' | 'TRANSFER_TO_RESERVE' | 'TRANSFER_FROM_RESERVE')
              }
              value={mode}
            >
              <SelectTrigger id={`goal-movement-mode-${goalId}`} aria-label="Como registrar">
                <SelectValue placeholder="Selecione o tipo de registro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INFORMATION_ONLY">Apenas progresso da meta</SelectItem>
                {supportsFinancialReflection ? (
                  <SelectItem
                    value={action === 'withdraw' ? 'TRANSFER_FROM_RESERVE' : 'TRANSFER_TO_RESERVE'}
                  >
                    Refletir também na conta de reserva
                  </SelectItem>
                ) : null}
              </SelectContent>
            </Select>
            {!supportsFinancialReflection ? (
              <p className="text-xs text-muted-foreground">
                Vincule uma conta de reserva à meta para refletir esse movimento financeiramente.
              </p>
            ) : null}
          </div>
        ) : null}

        {mode !== 'INFORMATION_ONLY' ? (
          <div className="space-y-2">
            <Label htmlFor={`goal-movement-account-${goalId}`}>{copy.counterpartLabel}</Label>
            <Select onValueChange={setCounterpartAccountId} value={counterpartAccountId}>
              <SelectTrigger id={`goal-movement-account-${goalId}`} aria-label={copy.counterpartLabel}>
                <SelectValue placeholder="Selecione a conta" />
              </SelectTrigger>
              <SelectContent>
                {counterpartAccounts.map((account) => (
                  <SelectItem key={account.id} value={String(account.id)}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor={`goal-movement-note-${goalId}`}>Observação</Label>
          <Input
            id={`goal-movement-note-${goalId}`}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Opcional"
            value={note}
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex justify-end">
          <Button disabled={pending} type="submit">
            {pending ? 'Salvando...' : copy.submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  )
}
