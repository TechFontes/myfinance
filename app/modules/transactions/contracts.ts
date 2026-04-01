export const transactionTypes = ["INCOME", "EXPENSE"] as const

export const transactionStatuses = [
  "PLANNED",
  "PENDING",
  "PAID",
  "CANCELED",
] as const

export type TransactionType = (typeof transactionTypes)[number]
export type TransactionStatus = (typeof transactionStatuses)[number]

export type TransactionFilters = {
  search?: string
  type?: TransactionType | "ALL"
  status?: TransactionStatus
  categoryId?: number
  accountId?: number
  creditCardId?: number
  periodStart?: Date
  periodEnd?: Date
  page?: number
  pageSize?: number
}

export type TransactionCreateInput = {
  type: TransactionType
  description: string
  value: string
  categoryId: number
  accountId?: number | null
  creditCardId?: number | null
  invoiceId?: number | null
  competenceDate: Date
  dueDate: Date
  paidAt?: Date | null
  status?: TransactionStatus
  fixed?: boolean
  installment?: number | null
  installments?: number | null
}

export type TransactionUpdateInput = Partial<TransactionCreateInput> & {
  id: number
}
