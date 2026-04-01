import { getUserFromRequest } from '@/lib/auth'
import { listAccountsByUser } from '@/modules/accounts/service'
import { listCardsByUser } from '@/modules/cards/service'
import { listCategoriesByUser } from '@/modules/categories/service'

export type TransactionFormCategoryOption = {
  id: number
  name: string
  type: 'INCOME' | 'EXPENSE'
}

export type TransactionFormEntityOption = {
  id: number
  name: string
}

export type TransactionFormOptions = {
  categories: TransactionFormCategoryOption[]
  accounts: TransactionFormEntityOption[]
  cards: TransactionFormEntityOption[]
}

export async function getTransactionFormOptions(): Promise<TransactionFormOptions> {
  const user = await getUserFromRequest()

  if (!user) {
    return {
      categories: [],
      accounts: [],
      cards: [],
    }
  }

  const [categories, accounts, cards] = await Promise.all([
    listCategoriesByUser(user.id),
    listAccountsByUser(user.id),
    listCardsByUser(user.id),
  ])

  return {
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
  }
}
