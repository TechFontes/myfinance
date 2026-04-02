import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CategoriesList } from '@/components/categories/CategoriesList'
import { getUserFromRequest } from '@/lib/auth'
import { listCategoriesByUser } from '@/modules/categories/service'

export default async function CategoriesPage() {
  const user = await getUserFromRequest()

  if (!user) {
    return redirect('/login?callbackUrl=%2Fdashboard%2Fcategories')
  }

  const categories = await listCategoriesByUser(user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">
            Organize receitas e despesas em categorias principais e subcategorias
          </p>
        </div>

        <Button asChild className="flex items-center gap-2">
          <Link href="/dashboard/categories/new">
            <PlusIcon size={16} />
            Nova categoria
          </Link>
        </Button>
      </div>

      <CategoriesList categories={categories} />
    </div>
  )
}
