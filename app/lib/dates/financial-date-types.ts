export const financialDateFields = [
  "competenceDate",
  "dueDate",
  "paidAt",
] as const

export type FinancialDateField = (typeof financialDateFields)[number]
