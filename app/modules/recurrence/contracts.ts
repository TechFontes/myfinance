export const recurrenceTypes = ['INCOME', 'EXPENSE'] as const

export const recurrenceStatuses = ['ACTIVE', 'INACTIVE'] as const

export const recurrenceFrequencies = ['MONTHLY'] as const

export const recurrenceEditScopes = ['THIS_ONLY', 'THIS_AND_FOLLOWING'] as const

export type RecurrenceType = (typeof recurrenceTypes)[number]
export type RecurrenceStatus = (typeof recurrenceStatuses)[number]
export type RecurrenceFrequency = (typeof recurrenceFrequencies)[number]
export type RecurrenceEditScope = (typeof recurrenceEditScopes)[number]

export type RecurrenceCreateInput = {
  type: RecurrenceType
  description: string
  value: string
  categoryId: number
  accountId?: number | null
  creditCardId?: number | null
  frequency: RecurrenceFrequency
  dayOfMonth?: number | null
  startDate: Date
  endDate?: Date | null
  active?: boolean
}

export type RecurrenceUpdateInput = Partial<RecurrenceCreateInput> & {
  id: number
  editScope?: RecurrenceEditScope
}
