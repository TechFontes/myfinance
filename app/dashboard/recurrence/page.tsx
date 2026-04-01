import { PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getUserFromRequest } from '@/lib/auth'
import { listRecurringRulesByUser } from '@/modules/recurrence/service'
import { RecurrenceList } from '@/components/recurrence/RecurrenceList'

async function getRecurringRules(): Promise<Awaited<ReturnType<typeof listRecurringRulesByUser>>> {
  const user = await getUserFromRequest()

  if (!user) {
    return []
  }

  return listRecurringRulesByUser(user.id)
}

export default async function RecurrencePage() {
  const recurrenceRules = await getRecurringRules()
  type RecurrenceRuleItem = Awaited<ReturnType<typeof getRecurringRules>>[number]

  if (recurrenceRules.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Recorrência</h1>
            <p className="text-muted-foreground">
              Registre regras que geram lançamentos previstos ao longo do tempo.
            </p>
          </div>

          <Button className="flex items-center gap-2">
            <PlusIcon size={16} />
            Nova regra
          </Button>
        </div>

        <Card className="border-dashed p-6 text-sm text-muted-foreground">
          A recorrência gera lançamentos previstos, não pagamentos automáticos.
        </Card>

        <Card className="border-dashed p-6 text-sm text-muted-foreground">
          Nenhuma regra recorrente cadastrada ainda.
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recorrência</h1>
          <p className="text-muted-foreground">
            Registre regras que geram lançamentos previstos ao longo do tempo.
          </p>
        </div>

        <Button className="flex items-center gap-2">
          <PlusIcon size={16} />
          Nova regra
        </Button>
      </div>

      <RecurrenceList
        rules={recurrenceRules.map((rule: RecurrenceRuleItem) => ({
          id: rule.id,
          description: rule.description,
          type: rule.type,
          value: rule.value.toString(),
          frequency: rule.frequency as 'MONTHLY',
          status: rule.active ? 'ACTIVE' : 'INACTIVE',
          startDate: rule.startDate,
          endDate: rule.endDate,
          accountLabel: rule.account?.name ?? null,
          creditCardLabel: rule.creditCard?.name ?? null,
        }))}
      />
    </div>
  )
}
