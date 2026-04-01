export const invoiceStatuses = ['OPEN', 'PAID', 'CANCELED'] as const

export type InvoiceStatus = (typeof invoiceStatuses)[number]

export type InvoiceRecord = {
  id: number
  creditCardId: number
  month: number
  year: number
  status: InvoiceStatus
  total: string
  dueDate: Date
}

export type InvoiceCreateInput = {
  creditCardId: number
  month: number
  year: number
  dueDate: Date
  status?: InvoiceStatus
  total?: string
}

export type InvoiceUpdateInput = Partial<InvoiceCreateInput> & {
  id: number
}

export type InstallmentPlan = {
  installmentGroupId: string
  installment: number
  installments: number
}
