import { redirect } from 'next/navigation'

import { CategoryCreateForm } from '@/components/categories/CategoryCreateForm'
import { getUserFromRequest } from '@/lib/auth'
import { listCategoriesByUser } from '@/modules/categories/service'

export default async function CategoryCreatePage() {
  const user = await getUserFromRequest()

  if (!user) {
    return redirect('/login?callbackUrl=%2Fdashboard%2Fcategories%2Fnew')
  }

  const categories = await listCategoriesByUser(user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nova categoria</h1>
        <p className="text-muted-foreground">
          Cadastre uma categoria principal ou subcategoria com a hierarquia correta.
        </p>
      </div>

      <CategoryCreateForm categories={categories} />
    </div>
  )
}
