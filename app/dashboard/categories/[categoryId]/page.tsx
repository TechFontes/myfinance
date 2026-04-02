import { redirect } from 'next/navigation'

import { CategoryCreateForm } from '@/components/categories/CategoryCreateForm'
import { Card } from '@/components/ui/card'
import { getUserFromRequest } from '@/lib/auth'
import { listCategoriesByUser } from '@/modules/categories/service'

type CategoryEditPageProps = {
  params: {
    categoryId: string
  }
}

export default async function CategoryEditPage({ params }: CategoryEditPageProps) {
  const user = await getUserFromRequest()

  if (!user) {
    return redirect(`/login?callbackUrl=${encodeURIComponent(`/dashboard/categories/${params.categoryId}`)}`)
  }

  const categories = await listCategoriesByUser(user.id)
  const category = categories.find((item) => item.id === Number(params.categoryId))

  if (!category) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar categoria</h1>
          <p className="text-muted-foreground">Atualize hierarquia, nome e estado da categoria.</p>
        </div>

        <Card className="border-dashed p-6 text-sm text-muted-foreground">
          Categoria não encontrada.
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar categoria</h1>
        <p className="text-muted-foreground">Atualize hierarquia, nome e estado da categoria.</p>
      </div>

      <CategoryCreateForm category={category} categories={categories} mode="edit" />
    </div>
  )
}
