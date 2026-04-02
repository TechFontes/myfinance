export const dashboardPeriodModes = ['MONTHLY'] as const

export const dashboardSections = [
  'summary',
  'pending',
  'accounts',
  'categories',
  'cardInvoices',
  'transfers',
] as const

export type DashboardPeriodMode = (typeof dashboardPeriodModes)[number]
export type DashboardSection = (typeof dashboardSections)[number]

export type DashboardPeriod = {
  mode: DashboardPeriodMode
  month: string
  year: number
  monthNumber: number
  label: string
  shortMonthLabel: string
}

export type DashboardSummary = {
  forecastIncome: string
  forecastExpense: string
  realizedIncome: string
  realizedExpense: string
  forecastBalance: string
  realizedBalance: string
}

export type DashboardPendingItem = {
  id: number
  description: string
  amount: string
  dueDate: Date
  status: 'PLANNED' | 'PENDING'
}

export type DashboardAccountSnapshot = {
  id: number
  name: string
  type: 'BANK' | 'WALLET' | 'OTHER'
  balance: string
  active: boolean
}

export type DashboardCategorySnapshot = {
  categoryId: number
  categoryName: string
  type: 'INCOME' | 'EXPENSE'
  total: string
}

export type DashboardInvoiceSnapshot = {
  invoiceId: number
  cardId: number
  cardName: string
  month: number
  year: number
  status: 'OPEN' | 'PAID' | 'CANCELED'
  dueDate: Date
  total: string
}

export type DashboardTransferSnapshot = {
  transferId: number
  description: string
  amount: string
  competenceDate: Date
  dueDate: Date
  status: 'PLANNED' | 'PENDING' | 'PAID' | 'CANCELED'
  sourceAccountName: string
  destinationAccountName: string
}

export type DashboardReport = {
  period: DashboardPeriod
  summary: DashboardSummary
  pending: DashboardPendingItem[]
  accounts: DashboardAccountSnapshot[]
  categories: DashboardCategorySnapshot[]
  cardInvoices: DashboardInvoiceSnapshot[]
  transfers: DashboardTransferSnapshot[]
}
