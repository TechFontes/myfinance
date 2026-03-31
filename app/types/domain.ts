export const transactionStatuses = [
  'PLANNED',
  'PENDING',
  'PAID',
  'CANCELED',
] as const

export const transactionKinds = [
  'INCOME',
  'EXPENSE',
  'TRANSFER',
] as const

export const accountTypes = [
  'BANK',
  'WALLET',
  'OTHER',
] as const

export const categoryTypes = [
  'INCOME',
  'EXPENSE',
] as const

export type TransactionStatus = (typeof transactionStatuses)[number]
export type TransactionKind = (typeof transactionKinds)[number]
export type AccountType = (typeof accountTypes)[number]
export type CategoryType = (typeof categoryTypes)[number]
