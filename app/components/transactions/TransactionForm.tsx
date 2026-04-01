'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { TransactionFormOptions } from '@/services/transactionFormOptions'

type TransactionInvoiceOption = {
  id: number
  month: number
  year: number
}

const transactionFormSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  description: z.string().min(1, 'Informe a descrição'),
  value: z.string().min(1, 'Informe o valor'),
  categoryId: z.string().min(1, 'Informe a categoria'),
  accountId: z.string().optional(),
  creditCardId: z.string().optional(),
  invoiceId: z.string().optional(),
  competenceDate: z.string().min(1, 'Informe a competência'),
  dueDate: z.string().min(1, 'Informe o vencimento'),
  paidAt: z.string().optional(),
  status: z.enum(['PLANNED', 'PENDING', 'PAID', 'CANCELED']),
  fixed: z.boolean().default(false),
  installment: z.string().optional(),
  installments: z.string().optional(),
})

type TransactionFormValues = z.input<typeof transactionFormSchema>

type TransactionFormProps = {
  options: TransactionFormOptions
}

const NONE_OPTION = '__none__'

function formatInvoiceLabel(invoice: TransactionInvoiceOption) {
  return `${String(invoice.month).padStart(2, '0')}/${invoice.year}`
}

export function TransactionForm({ options }: TransactionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [invoices, setInvoices] = useState<TransactionInvoiceOption[]>([])

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: 'EXPENSE',
      description: '',
      value: '',
      categoryId: '',
      accountId: '',
      creditCardId: '',
      invoiceId: '',
      competenceDate: '',
      dueDate: '',
      paidAt: '',
      status: 'PLANNED',
      fixed: false,
      installment: '',
      installments: '',
    },
  })

  const selectedType = useWatch({
    control: form.control,
    name: 'type',
  })

  const selectedCardId = useWatch({
    control: form.control,
    name: 'creditCardId',
  })

  const categoryOptions = useMemo(
    () => options.categories.filter((category) => category.type === selectedType),
    [options.categories, selectedType],
  )

  useEffect(() => {
    const currentCategoryId = form.getValues('categoryId')
    const isCurrentCategoryVisible = categoryOptions.some(
      (category) => String(category.id) === currentCategoryId,
    )

    if (currentCategoryId && !isCurrentCategoryVisible) {
      form.setValue('categoryId', '')
    }
  }, [categoryOptions, form])

  useEffect(() => {
    async function loadInvoices(creditCardId: string) {
      setInvoiceLoading(true)

      try {
        const response = await fetch(`/api/invoices?creditCardId=${creditCardId}`)

        if (!response.ok) {
          throw new Error('Falha ao carregar faturas')
        }

        const payload = (await response.json()) as TransactionInvoiceOption[]
        setInvoices(payload)
      } catch {
        setInvoices([])
      } finally {
        setInvoiceLoading(false)
      }
    }

    form.setValue('invoiceId', '')

    if (!selectedCardId) {
      setInvoices([])
      setInvoiceLoading(false)
      return
    }

    void loadInvoices(selectedCardId)
  }, [form, selectedCardId])

  async function onSubmit(values: TransactionFormValues) {
    setLoading(true)

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          accountId: values.accountId ? Number(values.accountId) : null,
          creditCardId: values.creditCardId ? Number(values.creditCardId) : null,
          invoiceId: values.invoiceId ? Number(values.invoiceId) : null,
          categoryId: Number(values.categoryId),
          competenceDate: values.competenceDate,
          dueDate: values.dueDate,
          paidAt: values.paidAt ? values.paidAt : null,
          fixed: values.fixed ?? false,
          installment: values.installment ? Number(values.installment) : null,
          installments: values.installments ? Number(values.installments) : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Falha ao salvar transação')
      }

      router.push('/dashboard/transactions')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nova transação</h1>
          <p className="text-muted-foreground">Registre uma receita, despesa ou movimentação futura do período.</p>
        </div>

        <Button variant="ghost" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados da transação</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INCOME">Receita</SelectItem>
                        <SelectItem value="EXPENSE">Despesa</SelectItem>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PLANNED">Prevista</SelectItem>
                        <SelectItem value="PENDING">Pendente</SelectItem>
                        <SelectItem value="PAID">Paga</SelectItem>
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
                      <Input placeholder="Pagamento de luz, salário, mercado..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger aria-label="Categoria">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((category) => (
                          <SelectItem key={category.id} value={String(category.id)}>
                            {category.name}
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
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === NONE_OPTION ? '' : value)}
                      value={field.value || NONE_OPTION}
                    >
                      <FormControl>
                        <SelectTrigger aria-label="Conta">
                          <SelectValue placeholder="Selecione uma conta" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE_OPTION}>Sem conta</SelectItem>
                        {options.accounts.map((account) => (
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
                name="creditCardId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cartão</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === NONE_OPTION ? '' : value)}
                      value={field.value || NONE_OPTION}
                    >
                      <FormControl>
                        <SelectTrigger aria-label="Cartão">
                          <SelectValue placeholder="Selecione um cartão" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE_OPTION}>Sem cartão</SelectItem>
                        {options.cards.map((card) => (
                          <SelectItem key={card.id} value={String(card.id)}>
                            {card.name}
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
                name="invoiceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fatura</FormLabel>
                    <Select
                      disabled={!selectedCardId || invoiceLoading}
                      onValueChange={(value) => field.onChange(value === NONE_OPTION ? '' : value)}
                      value={field.value || NONE_OPTION}
                    >
                      <FormControl>
                        <SelectTrigger aria-label="Fatura">
                          <SelectValue
                            placeholder={
                              !selectedCardId
                                ? 'Selecione um cartão antes'
                                : invoiceLoading
                                  ? 'Carregando faturas...'
                                  : 'Selecione uma fatura'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE_OPTION}>Sem fatura</SelectItem>
                        {invoices.map((invoice) => (
                          <SelectItem key={invoice.id} value={String(invoice.id)}>
                            {formatInvoiceLabel(invoice)}
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
                name="competenceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Competência</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vencimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paidAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pagamento</FormLabel>
                    <FormControl>
                      <Input type="date" placeholder="Opcional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fixed"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 md:col-span-2">
                    <FormControl>
                      <input
                        aria-label="Lançamento fixo"
                        checked={field.value}
                        className="h-4 w-4 rounded border-border"
                        type="checkbox"
                        onChange={(event) => field.onChange(event.target.checked)}
                      />
                    </FormControl>
                    <FormLabel className="m-0">Lançamento fixo</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="installment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parcela atual</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="Opcional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total de parcelas</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="Opcional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2 flex justify-end">
                <Button disabled={loading} type="submit">
                  {loading ? 'Salvando...' : 'Salvar transação'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
