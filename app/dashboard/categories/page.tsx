import { PlusIcon, FolderTreeIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getUserFromRequest } from '@/lib/auth'
import { listCategoriesByUser } from '@/modules/categories/service'

function getTypeLabel(type: string) {
  return type === 'INCOME' ? 'Receita' : 'Despesa'
}

function getStatusLabel(active: boolean) {
  return active ? 'Ativa' : 'Inativa'
}

export default async function CategoriesPage() {
  const user = await getUserFromRequest()
  const categories = user ? await listCategoriesByUser(user.id) : []
  const categoryNamesById = new Map(categories.map((category) => [category.id, category.name]))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">
            Organize receitas e despesas em categorias principais e subcategorias
          </p>
        </div>

        <Button className="flex items-center gap-2">
          <PlusIcon size={16} />
          Nova categoria
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => {
          const parentName = category.parentId
            ? categoryNamesById.get(category.parentId) ?? 'Categoria principal'
            : null

          return (
            <Card
              key={category.id}
              className="flex flex-col gap-4 border-slate-200 p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <FolderTreeIcon size={18} />
                    {category.name}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {parentName ? `Subcategoria de ${parentName}` : 'Categoria principal'}
                  </p>
                </div>

                <Badge variant="outline">{getTypeLabel(category.type)}</Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant={category.active ? 'default' : 'secondary'}>
                  {getStatusLabel(category.active)}
                </Badge>
                {category.parentId ? (
                  <Badge variant="outline">Nível 2</Badge>
                ) : (
                  <Badge variant="outline">Nível 1</Badge>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
