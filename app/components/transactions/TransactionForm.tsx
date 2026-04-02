'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Landmark, TrendingUp } from 'lucide-react'
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

const transactionFormSchema = z
  .object({
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
  .superRefine((values, context) => {
    if (values.status === 'PAID' && !values.paidAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Informe a data do pagamento',
        path: ['paidAt'],
      })
    }
  })

type TransactionFormValues = z.input<typeof transactionFormSchema>

export type TransactionFormInitialValues = {
  id: number
  type: 'INCOME' | 'EXPENSE'
  description: string
  value: string | number
  categoryId: number
  accountId?: number | null
  creditCardId?: number | null
  invoiceId?: number | null
  competenceDate: Date | string
  dueDate: Date | string
  paidAt?: Date | string | null
  status: 'PLANNED' | 'PENDING' | 'PAID' | 'CANCELED'
  fixed?: boolean
  installment?: number | null
  installments?: number | null
}

type TransactionFormProps = {
  options: TransactionFormOptions
  mode?: 'create' | 'edit'
  initialValues?: TransactionFormInitialValues
  action?: 'default' | 'pay'
}

const NONE_OPTION = '__none__'
const transactionIntentModes = [
  {
    value: 'INCOME' as const,
    label: 'Receita',
    description: 'Entrada em conta com categoria de receita.',
    icon: TrendingUp,
  },
  {
    value: 'EXPENSE_CASH' as const,
    label: 'Despesa em conta',
    description: 'Saída à vista usando uma conta do usuário.',
    icon: Landmark,
  },
  {
    value: 'EXPENSE_CARD' as const,
    label: 'Compra no cartão',
    description: 'Despesa lançada no cartão com vínculo de fatura.',
    icon: CreditCard,
  },
]

type TransactionIntentMode = (typeof transactionIntentModes)[number]['value']

function formatInvoiceLabel(invoice: TransactionInvoiceOption) {
  return `${String(invoice.month).padStart(2, '0')}/${invoice.year}`
}

function formatDateInput(value: Date | string | null | undefined) {
  if (!value) {
    return ''
  }

  return new Date(value).toISOString().slice(0, 10)
}

function inferIntentMode(initialValues?: TransactionFormInitialValues): TransactionIntentMode | null {
  if (!initialValues) {
    return null
  }

  if (initialValues.type === 'INCOME') {
    return 'INCOME'
  }

  return initialValues.creditCardId ? 'EXPENSE_CARD' : 'EXPENSE_CASH'
}

function buildDefaultValues(initialValues?: TransactionFormInitialValues): TransactionFormValues {
  return {
    type: initialValues?.type ?? 'EXPENSE',
    description: initialValues?.description ?? '',
    value: initialValues ? String(initialValues.value) : '',
    categoryId: initialValues ? String(initialValues.categoryId) : '',
    accountId: initialValues?.accountId ? String(initialValues.accountId) : '',
    creditCardId: initialValues?.creditCardId ? String(initialValues.creditCardId) : '',
    invoiceId: initialValues?.invoiceId ? String(initialValues.invoiceId) : '',
    competenceDate: formatDateInput(initialValues?.competenceDate),
    dueDate: formatDateInput(initialValues?.dueDate),
    paidAt: formatDateInput(initialValues?.paidAt),
    status: initialValues?.status ?? 'PLANNED',
    fixed: initialValues?.fixed ?? false,
    installment: initialValues?.installment ? String(initialValues.installment) : '',
    installments: initialValues?.installments ? String(initialValues.installments) : '',
  }
}

export function TransactionForm({
  options,
  mode = 'create',
  initialValues,
  action = 'default',
}: TransactionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [invoices, setInvoices] = useState<TransactionInvoiceOption[]>([])
  const [intentMode, setIntentMode] = useState<TransactionIntentMode | null>(() =>
    inferIntentMode(initialValues),
  )
  const latestInvoiceRequestId = useRef(0)
  const defaultValues = useMemo(() => buildDefaultValues(initialValues), [initialValues])
  const isEditMode = mode === 'edit'
  const isPaymentAction = action === 'pay'

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues,
  })

  const selectedType = useWatch({
    control: form.control,
    name: 'type',
  })

  const selectedCardId = useWatch({
    control: form.control,
    name: 'creditCardId',
  })

  const selectedStatus = useWatch({
    control: form.control,
    name: 'status',
  })

  const isIncomeMode = intentMode === 'INCOME'
  const isCashExpenseMode = intentMode === 'EXPENSE_CASH'
  const isCardExpenseMode = intentMode === 'EXPENSE_CARD'
  const shouldShowAccount = isIncomeMode || isCashExpenseMode
  const shouldShowCard = isCardExpenseMode
  const shouldShowInvoice = isCardExpenseMode
  const shouldShowInstallments = isCardExpenseMode
  const shouldShowPaymentDate = selectedStatus === 'PAID'

  const categoryOptions = useMemo(
    () => options.categories.filter((category) => category.type === selectedType),
    [options.categories, selectedType],
  )

  useEffect(() => {
    if (!isPaymentAction) {
      return
    }

    form.setValue('status', 'PAID')
  }, [form, isPaymentAction])

  useEffect(() => {
    if (!intentMode) {
      return
    }

    if (intentMode === 'INCOME') {
      form.setValue('type', 'INCOME')
      form.setValue('creditCardId', '')
      form.setValue('invoiceId', '')
      form.setValue('installment', '')
      form.setValue('installments', '')
      return
    }

    form.setValue('type', 'EXPENSE')

    if (intentMode === 'EXPENSE_CASH') {
      form.setValue('creditCardId', '')
      form.setValue('invoiceId', '')
      form.setValue('installment', '')
      form.setValue('installments', '')
      return
    }

    form.setValue('accountId', '')
  }, [form, intentMode])

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
    const requestId = latestInvoiceRequestId.current + 1
    latestInvoiceRequestId.current = requestId
    const controller = new AbortController()

    async function loadInvoices(creditCardId: string) {
      try {
        const response = await fetch(`/api/invoices?creditCardId=${creditCardId}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Falha ao carregar faturas')
        }

        const payload = (await response.json()) as TransactionInvoiceOption[]

        if (controller.signal.aborted || latestInvoiceRequestId.current !== requestId) {
          return
        }

        setInvoices(payload)
      } catch (error) {
        if (
          controller.signal.aborted ||
          latestInvoiceRequestId.current !== requestId ||
          (error instanceof Error && error.name === 'AbortError')
        ) {
          return
        }

        setInvoices([])
      } finally {
        if (controller.signal.aborted || latestInvoiceRequestId.current !== requestId) {
          return
        }

        setInvoiceLoading(false)
      }
    }

    form.setValue('invoiceId', '')

    if (!selectedCardId || !shouldShowCard) {
      setInvoices([])
      setInvoiceLoading(false)
      return () => {
        controller.abort()
      }
    }

    setInvoiceLoading(true)
    void loadInvoices(selectedCardId)

    return () => {
      controller.abort()
    }
  }, [form, selectedCardId, shouldShowCard])

  async function onSubmit(values: TransactionFormValues) {
    setLoading(true)

    try {
      const payload = {
        ...(isEditMode && initialValues ? { id: initialValues.id } : {}),
        ...values,
        status: isPaymentAction ? 'PAID' : values.status,
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
      }

      const response = await fetch(
        isEditMode && initialValues ? `/api/transactions/${initialValues.id}` : '/api/transactions',
        {
          method: isEditMode ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      )

      if (!response.ok) {
        throw new Error('Falha ao salvar transação')
      }

      router.push('/dashboard/transactions')
    } finally {
      setLoading(false)
    }
  }

  const pageTitle = isPaymentAction
    ? 'Informar pagamento'
    : isEditMode
      ? 'Editar transação'
      : 'Nova transação'

  const pageDescription = isPaymentAction
    ? 'Confirme a data do pagamento para refletir o lançamento no saldo corretamente.'
    : isEditMode
      ? 'Ajuste os dados do lançamento sem perder o contexto financeiro do período.'
      : 'Registre uma receita, despesa ou movimentação futura do período.'

  const submitLabel = loading
    ? isPaymentAction
      ? 'Confirmando...'
      : isEditMode
        ? 'Salvando...'
        : 'Salvando...'
    : isPaymentAction
      ? 'Confirmar pagamento'
      : isEditMode
        ? 'Salvar alterações'
        : 'Salvar transação'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
          <p className="text-muted-foreground">{pageDescription}</p>
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
          <div className="mb-6 space-y-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Como deseja registrar?</h2>
              <p className="text-sm text-muted-foreground">
                Escolha primeiro a intenção do lançamento para mostrar apenas os campos relevantes.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {transactionIntentModes.map((mode) => {
                const Icon = mode.icon
                const isActive = intentMode === mode.value

                return (
                  <button
                    key={mode.value}
                    className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                      isActive
                        ? 'border-emerald-500/60 bg-emerald-500/10 shadow-sm'
                        : 'border-border bg-background hover:border-emerald-500/30 hover:bg-emerald-500/5'
                    }`}
                    type="button"
                    onClick={() => setIntentMode(mode.value)}
                  >
                    <div className="mb-3 inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-700">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">{mode.label}</div>
                      <p className="text-sm leading-5 text-muted-foreground">{mode.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <Form {...form}>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
              {intentMode ? (
                <>
                  <div className="rounded-2xl border border-border/80 bg-muted/40 px-4 py-3 md:col-span-2">
                    <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Modo selecionado
                    </div>
                    <div className="mt-1 text-sm font-medium text-foreground">
                      {transactionIntentModes.find((mode) => mode.value === intentMode)?.label}
                    </div>
                  </div>

                  {isPaymentAction ? (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3">
                      <div className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-800">
                        Status de destino
                      </div>
                      <div className="mt-1 text-sm font-medium text-emerald-950">Paga</div>
                    </div>
                  ) : (
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
                  )}

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

                  {shouldShowAccount ? (
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
                  ) : null}

                  {shouldShowCard ? (
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
                  ) : null}

                  {shouldShowInvoice ? (
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
                  ) : null}

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

                  {shouldShowPaymentDate ? (
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
                  ) : null}

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
                        <FormLabel className="m-0">Lançamento recorrente</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {shouldShowInstallments ? (
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
                  ) : null}

                  {shouldShowInstallments ? (
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
                  ) : null}

                  <div className="md:col-span-2 flex justify-end">
                    <Button disabled={loading} type="submit">
                      {submitLabel}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground md:col-span-2">
                  Escolha um modo acima para começar o lançamento.
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
