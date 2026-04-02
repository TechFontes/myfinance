'use client'

import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { recurrenceCreateSchema } from '@/modules/recurrence'

type RecurrenceCreateFormProps = {
  options: {
    categories: Array<{ id: number; name: string; type: 'INCOME' | 'EXPENSE' }>
    accounts: Array<{ id: number; name: string }>
    cards: Array<{ id: number; name: string }>
  }
}

type FormValues = {
  type: 'INCOME' | 'EXPENSE'
  description: string
  value: string
  categoryId: string
  accountId: string
  creditCardId: string
  frequency: 'MONTHLY'
  dayOfMonth: string
  startDate: string
  endDate: string
  active: boolean
}

const NONE_OPTION = '__none__'

export function RecurrenceCreateForm({ options }: RecurrenceCreateFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [values, setValues] = useState<FormValues>({
    type: 'EXPENSE',
    description: '',
    value: '',
    categoryId: '',
    accountId: NONE_OPTION,
    creditCardId: NONE_OPTION,
    frequency: 'MONTHLY',
    dayOfMonth: '',
    startDate: '',
    endDate: '',
    active: true,
  })

  const categoryOptions = options.categories.filter((category) => category.type === values.type)

  useEffect(() => {
    const isSelectedCategoryVisible = categoryOptions.some(
      (category) => String(category.id) === values.categoryId,
    )

    if (values.categoryId && !isSelectedCategoryVisible) {
      setValues((current) => ({ ...current, categoryId: '' }))
    }
  }, [categoryOptions, values.categoryId])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = recurrenceCreateSchema.parse({
        type: values.type,
        description: values.description,
        value: values.value,
        categoryId: values.categoryId,
        accountId: values.accountId === NONE_OPTION ? null : values.accountId,
        creditCardId: values.creditCardId === NONE_OPTION ? null : values.creditCardId,
        frequency: values.frequency,
        dayOfMonth: values.dayOfMonth ? values.dayOfMonth : null,
        startDate: values.startDate,
        endDate: values.endDate ? values.endDate : null,
        active: values.active,
      })

      const response = await fetch('/api/recurrence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          startDate: values.startDate,
          endDate: values.endDate ? values.endDate : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Falha ao criar regra recorrente')
      }

      router.push('/dashboard/recurrence')
      router.refresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Nova regra</h1>
        <p className="text-muted-foreground">
          Defina uma regra recorrente para gerar lançamentos previstos ao longo do tempo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados da regra</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="type">
                Tipo
              </label>
              <select
                id="type"
                aria-label="Tipo"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={values.type}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    type: event.target.value as FormValues['type'],
                  }))
                }
              >
                <option value="INCOME">Receita</option>
                <option value="EXPENSE">Despesa</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="frequency">
                Frequência
              </label>
              <select
                id="frequency"
                aria-label="Frequência"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={values.frequency}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    frequency: event.target.value as FormValues['frequency'],
                  }))
                }
              >
                <option value="MONTHLY">Mensal</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="description">
                Descrição
              </label>
              <Input
                id="description"
                aria-label="Descrição"
                value={values.description}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="value">
                Valor
              </label>
              <Input
                id="value"
                aria-label="Valor"
                type="number"
                step="0.01"
                value={values.value}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    value: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="categoryId">
                Categoria
              </label>
              <select
                id="categoryId"
                aria-label="Categoria"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={values.categoryId}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    categoryId: event.target.value,
                  }))
                }
              >
                <option value="">Selecione uma categoria</option>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="accountId">
                Conta
              </label>
              <select
                id="accountId"
                aria-label="Conta"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={values.accountId}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    accountId: event.target.value,
                  }))
                }
              >
                <option value={NONE_OPTION}>Nenhuma</option>
                {options.accounts.map((account) => (
                  <option key={account.id} value={String(account.id)}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="creditCardId">
                Cartão
              </label>
              <select
                id="creditCardId"
                aria-label="Cartão"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={values.creditCardId}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    creditCardId: event.target.value,
                  }))
                }
              >
                <option value={NONE_OPTION}>Nenhum</option>
                {options.cards.map((card) => (
                  <option key={card.id} value={String(card.id)}>
                    {card.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="dayOfMonth">
                Dia do mês
              </label>
              <Input
                id="dayOfMonth"
                aria-label="Dia do mês"
                type="number"
                min="1"
                max="31"
                value={values.dayOfMonth}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    dayOfMonth: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="startDate">
                Início
              </label>
              <Input
                id="startDate"
                aria-label="Início"
                type="date"
                value={values.startDate}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    startDate: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="endDate">
                Fim
              </label>
              <Input
                id="endDate"
                aria-label="Fim"
                type="date"
                value={values.endDate}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    endDate: event.target.value,
                  }))
                }
              />
            </div>

            <div className="md:col-span-2">
              <Button disabled={isSubmitting} type="submit">
                Criar regra
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
