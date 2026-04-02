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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { accountTypes } from '@/modules/accounts'

const accountCreateFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome'),
  type: z.enum(accountTypes),
  initialBalance: z.string().optional(),
  institution: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
})

type AccountCreateFormValues = z.input<typeof accountCreateFormSchema>

const accountTypeLabels: Record<(typeof accountTypes)[number], string> = {
  BANK: 'Banco',
  WALLET: 'Carteira',
  OTHER: 'Outro',
}

export function AccountCreateForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const form = useForm<AccountCreateFormValues>({
    resolver: zodResolver(accountCreateFormSchema),
    defaultValues: {
      name: '',
      type: 'BANK',
      initialBalance: '',
      institution: '',
      color: '',
      icon: '',
    },
  })

  async function onSubmit(values: AccountCreateFormValues) {
    setLoading(true)
    setErrorMessage('')

    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name.trim(),
          type: values.type,
          initialBalance: values.initialBalance?.trim() || undefined,
          institution: values.institution?.trim() || undefined,
          color: values.color?.trim() || undefined,
          icon: values.icon?.trim() || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Falha ao criar conta')
      }

      router.push('/dashboard/accounts')
      router.refresh()
    } catch {
      setErrorMessage('Não foi possível salvar a conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Cadastro de conta</CardTitle>
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
                    <Input placeholder="Ex.: Nubank" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      {accountTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {accountTypeLabels[type]}
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
              name="initialBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saldo inicial</FormLabel>
                  <FormControl>
                    <Input placeholder="0,00" inputMode="decimal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instituição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: Itaú" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <FormControl>
                    <Input placeholder="#7a2cff" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone</FormLabel>
                  <FormControl>
                    <Input placeholder="wallet" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {errorMessage ? <p className="md:col-span-2 text-sm text-destructive">{errorMessage}</p> : null}

            <div className="flex items-center gap-3 md:col-span-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar conta'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
