export const transactionStatuses = [
  "PLANNED",
  "PENDING",
  "PAID",
  "CANCELED",
] as const

export const transactionKinds = [
  "INCOME",
  "EXPENSE",
  "TRANSFER",
] as const

export type TransactionStatus = (typeof transactionStatuses)[number]
export type TransactionKind = (typeof transactionKinds)[number]
