export const transferStatuses = [
  'PLANNED',
  'PENDING',
  'PAID',
  'CANCELED',
] as const

export type TransferStatus = (typeof transferStatuses)[number]

export type TransferRecord = {
  id: number
  userId: string
  sourceAccountId: number
  destinationAccountId: number
  amount: string
  description: string
  competenceDate: string
  dueDate: string
  paidAt: string | null
  status: TransferStatus
}

export type TransferCreateInput = {
  sourceAccountId: number
  destinationAccountId: number
  amount: string
  description: string
  competenceDate: string
  dueDate: string
}

export type TransferUpdateInput = Partial<TransferCreateInput> & {
  status?: TransferStatus
  paidAt?: string | null
}
