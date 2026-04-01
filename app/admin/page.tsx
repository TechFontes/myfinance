import { Card } from '@/components/ui/card'
import { AdminConsole } from '@/components/admin/AdminConsole'
import { getUserFromRequest } from '@/lib/auth'
import { getAdminFinancialOverview, listAdminUsers } from '@/modules/admin/service'
import { redirect } from 'next/navigation'

async function getAdminConsoleUsers() {
  const user = await getUserFromRequest()

  if (!user) {
    return redirect('/login?callbackUrl=%2Fadmin')
  }

  if (user.role !== 'ADMIN') {
    return redirect('/dashboard')
  }

  const users = await listAdminUsers()
  const overviews = await Promise.all(
    users.map(async (adminUser) => {
      const overview = await getAdminFinancialOverview(adminUser.id)

      return {
        id: adminUser.id,
        name: adminUser.name ?? 'Sem nome',
        email: adminUser.email,
        role: adminUser.role,
        status: adminUser.blockedAt ? ('BLOCKED' as const) : ('ACTIVE' as const),
        blockedAt: adminUser.blockedAt?.toISOString() ?? null,
        blockedReason: adminUser.blockedReason,
        financialSummary: {
          consolidatedBalance: '0.00',
          forecastBalance: '0.00',
          realizedBalance: '0.00',
          pendingCount: overview?.summary.pendingTransactions ?? 0,
        },
      }
    }),
  )

  return overviews
}

export default async function AdminPage() {
  const adminUsers = await getAdminConsoleUsers()

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Operação administrativa
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Painel administrativo</h1>
        <p className="text-muted-foreground">
          Painel exclusivo para operação, suporte e leitura financeira restrita.
        </p>
      </div>

      <Card className="border-dashed p-4 text-sm text-muted-foreground">
        Esta área é separada do dashboard do usuário final e não expõe edição financeira direta.
      </Card>

      <AdminConsole users={adminUsers} />
    </div>
  )
}
