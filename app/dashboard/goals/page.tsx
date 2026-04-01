import { PlusIcon } from 'lucide-react'

import { GoalsList } from '@/components/goals/GoalsList'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getUserFromRequest } from '@/lib/auth'
import { listGoalsByUser } from '@/modules/goals/service'

async function getGoals() {
  const user = await getUserFromRequest()

  if (!user) {
    return []
  }

  return listGoalsByUser(user.id)
}

export default async function GoalsPage() {
  const goals = await getGoals()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metas</h1>
          <p className="text-muted-foreground">
            Acompanhe metas simples com progresso manual e vínculo opcional com conta de reserva.
          </p>
        </div>

        <Button className="flex items-center gap-2">
          <PlusIcon size={16} />
          Nova meta
        </Button>
      </div>

      <Card className="border-dashed p-4 text-sm text-muted-foreground">
        Aportes podem ser apenas informacionais ou refletir financeiramente via transferência.
      </Card>

      <GoalsList goals={goals} showIntro={false} />
    </div>
  )
}
