'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
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
import { categoryTypes, type CategoryType } from '@/types/domain'

type CategoryOption = {
  id: number
  name: string
  type: CategoryType
  parentId: number | null
  active: boolean
}

const NONE_OPTION = '__none__'

const categoryCreateFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome'),
  type: z.enum(categoryTypes),
  parentId: z.string().optional(),
})

type CategoryCreateFormValues = z.input<typeof categoryCreateFormSchema>

type CategoryCreateFormProps = {
  categories: CategoryOption[]
  mode?: 'create' | 'edit'
  category?: {
    id: number
    name: string
    type: CategoryType
    parentId: number | null
    active: boolean
  }
}

function getCategoryTypeLabel(type: CategoryType) {
  return type === 'INCOME' ? 'Receita' : 'Despesa'
}

export function CategoryCreateForm({
  categories,
  mode = 'create',
  category,
}: CategoryCreateFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<CategoryCreateFormValues>({
    resolver: zodResolver(categoryCreateFormSchema),
    defaultValues: {
      name: category?.name ?? '',
      type: category?.type ?? 'EXPENSE',
      parentId: category?.parentId ? String(category.parentId) : NONE_OPTION,
    },
  })

  const [active, setActive] = useState(category?.active ?? true)
  const selectedType = form.watch('type')
  const selectedParentId = form.watch('parentId')

  const parentOptions = useMemo(
    () =>
      categories.filter(
        (item) =>
          item.active &&
          item.type === selectedType &&
          (!category || item.id !== category.id),
      ),
    [categories, category, selectedType],
  )

  useEffect(() => {
    if (
      selectedParentId &&
      selectedParentId !== NONE_OPTION &&
      !parentOptions.some((category) => String(category.id) === selectedParentId)
    ) {
      form.setValue('parentId', NONE_OPTION)
    }
  }, [form, parentOptions, selectedParentId])

  useEffect(() => {
    form.reset({
      name: category?.name ?? '',
      type: category?.type ?? 'EXPENSE',
      parentId: category?.parentId ? String(category.parentId) : NONE_OPTION,
    })
    setActive(category?.active ?? true)
  }, [category, form, mode])

  async function onSubmit(values: CategoryCreateFormValues) {
    setLoading(true)

    try {
      const payload: {
        name: string
        type: CategoryType
        parentId?: number
        active?: boolean
      } = {
        name: values.name.trim(),
        type: values.type,
      }

      if (values.parentId && values.parentId !== NONE_OPTION) {
        payload.parentId = Number(values.parentId)
      }

      if (mode === 'edit') {
        payload.active = active
      }

      const response = await fetch(
        mode === 'edit' && category ? `/api/categories/${category.id}` : '/api/categories',
        {
          method: mode === 'edit' ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      )

      if (!response.ok) {
        throw new Error('Falha ao salvar categoria')
      }

      router.push('/dashboard/categories')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Dados da categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: Moradia" {...field} />
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {getCategoryTypeLabel(type)}
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
              name="parentId"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Categoria pai</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? NONE_OPTION}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Nenhuma" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NONE_OPTION}>Nenhuma</SelectItem>
                      {parentOptions.map((category) => (
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

            {mode === 'edit' ? (
              <div className="flex items-center gap-3 md:col-span-2">
                <input
                  checked={active}
                  className="h-4 w-4 rounded border-border text-primary"
                  id="active"
                  onChange={(event) => setActive(event.target.checked)}
                  type="checkbox"
                />
                <label className="text-sm font-medium" htmlFor="active">
                  Categoria ativa
                </label>
              </div>
            ) : null}

            <div className="flex items-center gap-3 md:col-span-2">
              <Button type="submit" disabled={loading}>
                {mode === 'edit' ? 'Salvar alterações' : 'Salvar categoria'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => router.push('/dashboard/categories')}>
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
