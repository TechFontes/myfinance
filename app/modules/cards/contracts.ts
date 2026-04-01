export const creditCardVisualFields = ['color', 'icon'] as const

export type CreditCardRecord = {
  id: number
  userId: string
  name: string
  limit: string
  closeDay: number
  dueDay: number
  color: string | null
  icon: string | null
  active: boolean
  createdAt: Date
}

export type CreditCardCreateInput = {
  name: string
  limit: string
  closeDay: number
  dueDay: number
  color?: string | null
  icon?: string | null
  active?: boolean
}

export type CreditCardUpdateInput = Partial<CreditCardCreateInput> & {
  id: number
}
