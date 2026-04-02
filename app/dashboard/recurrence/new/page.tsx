import { redirect } from 'next/navigation'

import { RecurrenceCreateForm } from '@/components/recurrence/RecurrenceCreateForm'
import { getUserFromRequest } from '@/lib/auth'
import { listAccountsByUser } from '@/modules/accounts/service'
import { listCardsByUser } from '@/modules/cards/service'
import { listCategoriesByUser } from '@/modules/categories/service'

export default async function RecurrenceCreatePage() {
  const user = await getUserFromRequest()

  if (!user) {
    return redirect('/login?callbackUrl=%2Fdashboard%2Frecurrence%2Fnew')
  }

  const [categories, accounts, cards] = await Promise.all([
    listCategoriesByUser(user.id),
    listAccountsByUser(user.id),
    listCardsByUser(user.id),
  ])

  return (
    <RecurrenceCreateForm
      options={{
        categories: categories
          .filter((category) => category.active)
          .map((category) => ({
            id: category.id,
            name: category.name,
            type: category.type,
          })),
        accounts: accounts
          .filter((account) => account.active)
          .map((account) => ({ id: account.id, name: account.name })),
        cards: cards.filter((card) => card.active).map((card) => ({ id: card.id, name: card.name })),
      }}
    />
  )
}
