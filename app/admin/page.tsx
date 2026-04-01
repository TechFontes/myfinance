import { Card } from '@/components/ui/card'
import { AdminConsole } from '@/components/admin/AdminConsole'

const adminUsers = [
  {
    id: 'admin-1',
    name: 'Tech Fontes',
    email: 'tech.fontes@example.com',
    role: 'ADMIN' as const,
    status: 'ACTIVE' as const,
    blockedAt: null,
    blockedReason: null,
    financialSummary: {
      consolidatedBalance: '12500.00',
      forecastBalance: '13200.00',
      realizedBalance: '11850.00',
      pendingCount: 2,
    },
  },
  {
    id: 'user-2',
    name: 'Marina Lima',
    email: 'marina@example.com',
    role: 'USER' as const,
    status: 'BLOCKED' as const,
    blockedAt: '2026-03-20T00:00:00.000Z',
    blockedReason: 'Suporte administrativo',
    financialSummary: {
      consolidatedBalance: '4800.00',
      forecastBalance: '5400.00',
      realizedBalance: '4200.00',
      pendingCount: 5,
    },
  },
]

export default function AdminPage() {
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
