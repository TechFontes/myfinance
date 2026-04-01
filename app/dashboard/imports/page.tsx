import { getUserFromRequest } from '@/lib/auth'
import { listCategoriesByUser } from '@/modules/categories/service'
import { CsvImportReviewPanel } from '@/components/imports/CsvImportReviewPanel'
import { redirect } from 'next/navigation'

export default async function ImportsPage() {
  const user = await getUserFromRequest()

  if (!user) {
    return redirect('/login?callbackUrl=%2Fdashboard%2Fimports')
  }

  const categories = (await listCategoriesByUser(user.id)).map((category) => ({
    id: category.id,
    name: category.name,
  }))

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
