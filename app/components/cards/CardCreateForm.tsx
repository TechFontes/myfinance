'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cardCreateSchema } from '@/modules/cards'

type CardCreateFormValues = z.input<typeof cardCreateSchema>

type CardFormInitialValues = {
  id: number
  name: string
  limit: string
  closeDay: number
  dueDay: number
  color?: string | null
  icon?: string | null
  active: boolean
}

type CardCreateFormProps = {
  mode?: 'create' | 'edit'
  initialValues?: CardFormInitialValues
}

function normalizeOptionalText(value?: string | null) {
  const normalized = value?.trim() ?? ''
  return normalized.length > 0 ? normalized : undefined
}

export function CardCreateForm({
  mode = 'create',
  initialValues,
}: CardCreateFormProps = {}) {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isEditMode = mode === 'edit'

  const form = useForm<CardCreateFormValues>({
    resolver: zodResolver(cardCreateSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      limit: initialValues?.limit ?? '',
      closeDay: initialValues ? String(initialValues.closeDay) : '',
      dueDay: initialValues ? String(initialValues.dueDay) : '',
      color: initialValues?.color ?? '',
      icon: initialValues?.icon ?? '',
      active: initialValues?.active ?? true,
    },
  })

  async function onSubmit(values: CardCreateFormValues) {
    setLoading(true)
    setSubmitError(null)

    try {
      const response = await fetch(isEditMode && initialValues ? `/api/cards/${initialValues.id}` : '/api/cards', {
        method: isEditMode ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(isEditMode && initialValues ? { id: initialValues.id } : {}),
          name: values.name,
          limit: values.limit,
          closeDay: Number(values.closeDay),
          dueDay: Number(values.dueDay),
          color: normalizeOptionalText(values.color) ?? null,
          icon: normalizeOptionalText(values.icon) ?? null,
          active: values.active ?? true,
        }),
      })

      if (!response.ok) {
        throw new Error('Falha ao criar cartão')
      }

      router.push('/dashboard/cards')
    } catch {
      setSubmitError('Não foi possível salvar o cartão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditMode ? 'Editar cartão' : 'Novo cartão'}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode
            ? 'Atualize limite, fechamento e vencimento do cartão.'
            : 'Cadastre o limite, fechamento e vencimento do cartão.'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados do cartão</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" placeholder="Ex.: Nubank" {...register('name')} />
                {errors.name ? (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="limit">Limite</Label>
                <Input
                  id="limit"
                  inputMode="decimal"
                  placeholder="5000.00"
                  {...register('limit')}
                />
                {errors.limit ? (
                  <p className="text-sm text-destructive">{errors.limit.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="closeDay">Dia de fechamento</Label>
                <Input
                  id="closeDay"
                  inputMode="numeric"
                  type="number"
                  min={1}
                  max={31}
                  {...register('closeDay')}
                />
                {errors.closeDay ? (
                  <p className="text-sm text-destructive">{errors.closeDay.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDay">Dia de vencimento</Label>
                <Input
                  id="dueDay"
                  inputMode="numeric"
                  type="number"
                  min={1}
                  max={31}
                  {...register('dueDay')}
                />
                {errors.dueDay ? (
                  <p className="text-sm text-destructive">{errors.dueDay.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Cor</Label>
                <Input
                  id="color"
                  placeholder="#7a2cff"
                  {...register('color', {
                    setValueAs: normalizeOptionalText,
                  })}
                />
                {errors.color ? (
                  <p className="text-sm text-destructive">{errors.color.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Ícone</Label>
                <Input
                  id="icon"
                  placeholder="credit-card"
                  {...register('icon', {
                    setValueAs: normalizeOptionalText,
                  })}
                />
                {errors.icon ? (
                  <p className="text-sm text-destructive">{errors.icon.message}</p>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="active"
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary"
                {...register('active')}
              />
              <Label htmlFor="active">Ativo</Label>
            </div>

            {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/cards')}
              >
                Cancelar
              </Button>

              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : isEditMode ? 'Salvar alterações' : 'Salvar cartão'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
