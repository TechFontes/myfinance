import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

type RecurrenceRuleItem = {
  id: number
  description: string
  type: 'INCOME' | 'EXPENSE'
  value: string
  frequency: 'MONTHLY'
  status: 'ACTIVE' | 'INACTIVE'
  startDate: string | Date
  endDate: string | Date | null
  accountLabel: string | null
  creditCardLabel: string | null
}

type RecurrenceListProps = {
  rules: RecurrenceRuleItem[]
}

const frequencyLabels: Record<RecurrenceRuleItem['frequency'], string> = {
  MONTHLY: 'Mensal',
}

const statusLabels: Record<RecurrenceRuleItem['status'], string> = {
  ACTIVE: 'Ativa',
  INACTIVE: 'Inativa',
}

function formatDate(value: string | Date | null) {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleDateString('pt-BR')
}

function formatCurrency(value: string) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function RecurrenceList({ rules }: RecurrenceListProps) {
  return (
    <div className="space-y-4">
      <Card className="border-dashed p-4 text-sm text-muted-foreground">
        A recorrência gera lançamentos previstos, não pagamentos automáticos.
      </Card>

      {rules.length === 0 ? (
        <Card className="border-dashed p-6 text-sm text-muted-foreground">
          Nenhuma regra recorrente cadastrada ainda.
        </Card>
      ) : (
        <div data-testid="recurrence-list" className="grid gap-4">
          {rules.map((rule) => (
            <Card key={rule.id} className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{rule.description}</h2>
                    <Badge variant={rule.status === 'ACTIVE' ? 'secondary' : 'outline'}>
                      {statusLabels[rule.status]}
                    </Badge>
                    <Badge variant="outline">{frequencyLabels[rule.frequency]}</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {rule.type === 'INCOME' ? 'Receita recorrente' : 'Despesa recorrente'} de{' '}
                    {formatCurrency(rule.value)}
                  </p>
                </div>

                <Badge variant="outline">Regra recorrente</Badge>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                <div>
                  <div className="font-medium text-foreground">Início</div>
                  <div>{formatDate(rule.startDate)}</div>
                </div>
                <div>
                  <div className="font-medium text-foreground">Término</div>
                  <div>{formatDate(rule.endDate)}</div>
                </div>
                <div>
                  <div className="font-medium text-foreground">Vínculo</div>
                  <div>{rule.accountLabel ? `Conta: ${rule.accountLabel}` : rule.creditCardLabel ? `Cartão: ${rule.creditCardLabel}` : '—'}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
