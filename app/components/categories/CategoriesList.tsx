import Link from 'next/link'
import { PencilIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { CategoryRecord } from '@/modules/categories'

type CategoriesListProps = {
  categories: CategoryRecord[]
}

type TypeConfig = {
  key: 'INCOME' | 'EXPENSE'
  label: string
  icon: string
  accent: string
  badgeClass: string
}

const typeConfigs: TypeConfig[] = [
  {
    key: 'INCOME',
    label: 'Receita',
    icon: '📥',
    accent: 'border-emerald-500/60',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  {
    key: 'EXPENSE',
    label: 'Despesa',
    icon: '📤',
    accent: 'border-rose-500/60',
    badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  },
]

function CategoryRow({
  category,
  isChild,
  accentClass,
}: {
  category: CategoryRecord
  isChild: boolean
  accentClass: string
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 py-2 ${
        isChild ? `ml-6 border-l-2 pl-4 ${accentClass}` : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={isChild ? 'text-sm' : 'text-sm font-semibold'}>{category.name}</span>
        <Badge
          className="text-xs"
          variant={category.active ? 'default' : 'secondary'}
        >
          {category.active ? 'Ativa' : 'Inativa'}
        </Badge>
      </div>

      <Button asChild size="icon" variant="ghost" className="h-8 w-8">
        <Link
          aria-label={`Editar categoria ${category.name}`}
          href={`/dashboard/categories/${category.id}`}
        >
          <PencilIcon className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}

export function CategoriesList({ categories }: CategoriesListProps) {
  const parents = categories.filter((c) => c.parentId === null)
  const childrenByParent = new Map<number, CategoryRecord[]>()

  for (const cat of categories) {
    if (cat.parentId !== null) {
      const existing = childrenByParent.get(cat.parentId) ?? []
      existing.push(cat)
      childrenByParent.set(cat.parentId, existing)
    }
  }

  return (
    <div className="space-y-8">
      {typeConfigs.map((config) => {
        const typeParents = parents.filter((p) => p.type === config.key)
        const typeCount = categories.filter((c) => c.type === config.key).length

        if (typeCount === 0) return null

        return (
          <section key={config.key} aria-label={`Categorias de ${config.label}`}>
            <div className="mb-4 flex items-center gap-3">
              <span className="text-xl" role="img" aria-hidden="true">
                {config.icon}
              </span>
              <h2 className="text-lg font-bold">{config.label}</h2>
              <Badge variant="outline" className={config.badgeClass}>
                {typeCount} {typeCount === 1 ? 'categoria' : 'categorias'}
              </Badge>
            </div>

            <div className="rounded-lg border border-border/60 bg-card px-4 divide-y divide-border/40">
              {typeParents.map((parent) => {
                const children = childrenByParent.get(parent.id) ?? []

                return (
                  <div key={parent.id}>
                    <CategoryRow
                      category={parent}
                      isChild={false}
                      accentClass={config.accent}
                    />
                    {children.map((child) => (
                      <CategoryRow
                        key={child.id}
                        category={child}
                        isChild={true}
                        accentClass={config.accent}
                      />
                    ))}
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
