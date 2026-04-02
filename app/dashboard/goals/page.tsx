import Link from 'next/link'
import { PlusIcon } from 'lucide-react'
import { redirect } from 'next/navigation'

import { GoalsList } from '@/components/goals/GoalsList'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getUserFromRequest } from '@/lib/auth'
import { listAccountsByUser } from '@/modules/accounts/service'
import { listGoalsByUser } from '@/modules/goals/service'

export default async function GoalsPage() {
  const user = await getUserFromRequest()

  if (!user) {
    return redirect('/login?callbackUrl=%2Fdashboard%2Fgoals')
  }

  const [goals, accounts] = await Promise.all([
    listGoalsByUser(user.id),
    listAccountsByUser(user.id),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metas</h1>
          <p className="text-muted-foreground">
            Acompanhe objetivos financeiros com aporte, resgate, ajuste e vínculo opcional com conta de reserva.
          </p>
        </div>

        <Button asChild className="flex items-center gap-2">
          <Link href="/dashboard/goals/new">
            <PlusIcon size={16} />
            Nova meta
          </Link>
        </Button>
      </div>

      <Card className="border-dashed p-4 text-sm text-muted-foreground">
        Aportes, resgates e ajustes podem ser informacionais ou refletir a reserva vinculada.
      </Card>

      <GoalsList
        goals={goals}
        accounts={accounts.map((account) => ({
          id: account.id,
          name: account.name,
        }))}
        showIntro={false}
      />
    </div>
  )
}
