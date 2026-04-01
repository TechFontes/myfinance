import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserFromRequest } from '@/lib/auth'
import { listCardsByUser } from '@/modules/cards/service'
import { redirect } from 'next/navigation'

type CardDetailPageProps = {
  params: {
    cardId: string
  }
}

function formatCurrency(value: string) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function formatDate(value: Date) {
  return new Date(value).toLocaleDateString('pt-BR')
}

export default async function CardDetailPage({ params }: CardDetailPageProps) {
  const user = await getUserFromRequest()

  if (!user) {
    return redirect(`/login?callbackUrl=${encodeURIComponent(`/dashboard/cards/${params.cardId}`)}`)
  }

  const cards = await listCardsByUser(user.id)
  const card = cards.find((item) => item.id === Number(params.cardId))

  if (!card) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cartão</h1>
          <p className="text-muted-foreground">Detalhe do cartão e próximas faturas.</p>
        </div>
        <Card className="border-dashed p-6 text-sm text-muted-foreground">
          Cartão não encontrado.
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{card.name}</h1>
        <p className="text-muted-foreground">
          Fechamento dia {card.closeDay} e vencimento dia {card.dueDay}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resumo do cartão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Limite: {formatCurrency(card.limit.toString())}</p>
            <p>Status: {card.active ? 'Ativo' : 'Inativo'}</p>
            {card.color ? <p>Cor: {card.color}</p> : null}
            {card.icon ? <p>Ícone: {card.icon}</p> : null}
            <p>Criado em: {formatDate(card.createdAt)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas faturas</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Sem faturas em aberto para este cartão.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
