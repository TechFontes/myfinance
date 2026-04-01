import { PlusIcon } from 'lucide-react'

import { CardsList } from '@/components/cards/CardsList'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getUserFromRequest } from '@/lib/auth'
import { listCardsByUser } from '@/modules/cards/service'

async function getCards() {
  const user = await getUserFromRequest()

  if (!user) {
    return []
  }

  return listCardsByUser(user.id)
}

export default async function CardsPage() {
  const cards = await getCards()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cartões</h1>
          <p className="text-muted-foreground">
            Gerencie limites, fechamento e vencimento dos seus cartões
          </p>
        </div>

        <Button className="flex items-center gap-2">
          <PlusIcon size={16} />
          Novo cartão
        </Button>
      </div>

      <Card className="border-dashed p-4 text-sm text-muted-foreground">
        Esta visão organiza os cartões pelo contrato financeiro novo, com fechamento e vencimento separados.
      </Card>

      <CardsList cards={cards} />
    </div>
  )
}
