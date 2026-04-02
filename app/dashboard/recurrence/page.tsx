import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getUserFromRequest } from '@/lib/auth'
import { listRecurringRulesByUser } from '@/modules/recurrence/service'
import { RecurrenceList } from '@/components/recurrence/RecurrenceList'

export default async function RecurrencePage() {
  const user = await getUserFromRequest()

  if (!user) {
    return redirect('/login?callbackUrl=%2Fdashboard%2Frecurrence')
  }

  const recurrenceRules = await listRecurringRulesByUser(user.id)
  type RecurrenceRuleItem = Awaited<ReturnType<typeof listRecurringRulesByUser>>[number]

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

          <Button asChild className="flex items-center gap-2">
            <Link href="/dashboard/recurrence/new">
              <PlusIcon size={16} />
              Nova regra
            </Link>
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

        <Button asChild className="flex items-center gap-2">
          <Link href="/dashboard/recurrence/new">
            <PlusIcon size={16} />
            Nova regra
          </Link>
        </Button>
      </div>

      <Card className="border-dashed p-6 text-sm text-muted-foreground">
        A recorrência gera lançamentos previstos, não pagamentos automáticos.
      </Card>

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
