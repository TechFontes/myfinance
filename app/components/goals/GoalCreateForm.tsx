'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const NONE_OPTION = '__none__'

const goalCreateFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome da meta'),
  targetAmount: z.string().trim().min(1, 'Informe o valor-alvo'),
  reserveAccountId: z.string(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELED']),
  description: z.string().optional(),
})

type GoalCreateFormValues = z.input<typeof goalCreateFormSchema>

type GoalFormInitialValues = {
  id: number
  name: string
  targetAmount: string
  reserveAccountId?: number | null
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELED'
  description?: string | null
}

type GoalCreateFormProps = {
  accounts: Array<{
    id: number
    name: string
  }>
  mode?: 'create' | 'edit'
  initialValues?: GoalFormInitialValues
}

export function GoalCreateForm({
  accounts,
  mode = 'create',
  initialValues,
}: GoalCreateFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEditMode = mode === 'edit'

  const form = useForm<GoalCreateFormValues>({
    resolver: zodResolver(goalCreateFormSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      targetAmount: initialValues?.targetAmount ?? '',
      reserveAccountId: initialValues?.reserveAccountId ? String(initialValues.reserveAccountId) : NONE_OPTION,
      status: initialValues?.status ?? 'ACTIVE',
      description: initialValues?.description ?? '',
    },
  })

  async function onSubmit(values: GoalCreateFormValues) {
    setLoading(true)

    try {
      const response = await fetch(isEditMode && initialValues ? `/api/goals/${initialValues.id}` : '/api/goals', {
        method: isEditMode ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(isEditMode && initialValues ? { id: initialValues.id } : {}),
          name: values.name.trim(),
          targetAmount: values.targetAmount.trim(),
          reserveAccountId:
            values.reserveAccountId && values.reserveAccountId !== NONE_OPTION
              ? Number(values.reserveAccountId)
              : null,
          status: values.status,
          description: values.description?.trim() ? values.description.trim() : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Falha ao criar meta')
      }

      router.replace('/dashboard/goals')
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditMode ? 'Editar meta' : 'Nova meta'}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode
            ? 'Atualize valor-alvo, reserva e status da meta.'
            : 'Crie uma meta com conta de reserva opcional e status inicial ativo.'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados da meta</CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex.: Reserva de emergência" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta</FormLabel>
                    <FormControl>
                      <Input placeholder="0,00" type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reserveAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta de reserva</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE_OPTION}>Sem conta de reserva</SelectItem>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={String(account.id)}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Ativa</SelectItem>
                        <SelectItem value="COMPLETED">Concluída</SelectItem>
                        <SelectItem value="CANCELED">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <textarea
                        className="min-h-32 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/60"
                        placeholder="Contexto opcional da meta"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : isEditMode ? 'Salvar alterações' : 'Criar meta'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
