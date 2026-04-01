import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { GoalRecord } from '@/modules/goals'

type GoalsListProps = {
  goals: GoalRecord[]
  showIntro?: boolean
}

function formatCurrency(value: string) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function getStatusLabel(status: GoalRecord['status']) {
  switch (status) {
    case 'COMPLETED':
      return 'Meta concluída'
    case 'CANCELED':
      return 'Meta cancelada'
    default:
      return 'Meta ativa'
  }
}

export function GoalsList({ goals, showIntro = true }: GoalsListProps) {
  if (goals.length === 0) {
    return (
      <Card className="border-dashed p-6 text-sm text-muted-foreground">
        Nenhuma meta cadastrada ainda.
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {showIntro ? (
        <Card className="border-dashed p-4 text-sm text-muted-foreground">
          <p>Progresso manual</p>
          <p>Aportes podem ser apenas informacionais ou refletir financeiramente via transferência.</p>
        </Card>
      ) : null}

      <div data-testid="goals-list" className="grid gap-4">
        {goals.map((goal) => {
          const progress =
            Number(goal.targetAmount) === 0
              ? 0
              : Math.min(100, Math.round((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100))

          return (
            <Card key={goal.id} className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{goal.name}</h2>
                    <Badge variant={goal.status === 'ACTIVE' ? 'secondary' : 'outline'}>
                      {getStatusLabel(goal.status)}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                  </p>
                </div>

                <Badge variant="outline">Meta financeira</Badge>
              </div>

              <div className="mt-4 space-y-3">
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    aria-hidden="true"
                    className="h-full rounded-full bg-slate-900 dark:bg-slate-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                  <div>
                    <div className="font-medium text-foreground">Progresso</div>
                    <div>{progress}% concluído</div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Atualização</div>
                    <div>Atualização manual</div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Reserva</div>
                    <div>
                      {goal.reserveAccountId
                        ? `Conta de reserva #${goal.reserveAccountId}`
                        : 'Sem conta de reserva vinculada'}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
