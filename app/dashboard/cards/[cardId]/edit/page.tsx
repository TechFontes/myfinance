import { notFound, redirect } from 'next/navigation'
import { CardCreateForm } from '@/components/cards/CardCreateForm'
import { getUserFromRequest } from '@/lib/auth'
import { getCardByUser } from '@/modules/cards/service'

function parseCardId(value: string) {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export default async function CardEditPage({
  params,
}: {
  params: Promise<{ cardId: string }>
}) {
  const user = await getUserFromRequest()

  if (!user) {
    return redirect('/login?callbackUrl=%2Fdashboard%2Fcards')
  }

  const { cardId: cardIdParam } = await params
  const cardId = parseCardId(cardIdParam)

  if (!cardId) {
    return notFound()
  }

  const card = await getCardByUser(user.id, cardId)

  if (!card) {
    return notFound()
  }

  return (
    <CardCreateForm
      initialValues={{
        id: card.id,
        name: card.name,
        limit: card.limit,
        closeDay: card.closeDay,
        dueDay: card.dueDay,
        color: card.color,
        icon: card.icon,
        active: card.active,
      }}
      mode="edit"
    />
  )
}
