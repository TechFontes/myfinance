import { Card } from '@/components/ui/card'
import { getUserFromRequest } from '@/lib/auth'
import { listCategoriesByUser } from '@/modules/categories/service'
import { CsvImportReviewPanel } from '@/components/imports/CsvImportReviewPanel'

async function getCategories() {
  const user = await getUserFromRequest()

  if (!user) {
    return { user: null, categories: [] as Array<{ id: number; name: string }> }
  }

  const categories = await listCategoriesByUser(user.id)

  return {
    user,
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
    })),
  }
}

export default async function ImportsPage() {
  const { user, categories } = await getCategories()

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            Operação guiada
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Importações</h1>
          <p className="text-muted-foreground">
            Revise o preview do CSV antes de confirmar qualquer importação.
          </p>
        </div>

        <Card className="border-dashed p-6 text-sm text-muted-foreground">
          Faça login para revisar e confirmar importações de transações.
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Operação guiada
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Importações</h1>
        <p className="text-muted-foreground">
          Revise o preview do CSV antes de confirmar qualquer importação.
        </p>
      </div>

      <CsvImportReviewPanel availableCategories={categories} />
    </div>
  )
}
