export type AdminUserRole = 'USER' | 'ADMIN'

export type AdminUserListItem = {
  id: string
  name: string | null
  email: string
  role: AdminUserRole
  blockedAt: Date | null
  blockedReason: string | null
  createdAt: Date
  updatedAt: Date
}

export type AdminUserUpdateInput = {
  name?: string | null
  email?: string
  role?: AdminUserRole
}

export type AdminBlockUserInput = {
  reason: string
}

export type AdminFinancialAccount = {
  id: number
  name: string
  type: 'BANK' | 'WALLET' | 'OTHER'
  initialBalance: string
  active: boolean
  institution: string | null
  color: string | null
  icon: string | null
}

export type AdminFinancialCard = {
  id: number
  name: string
  limit: string
  closeDay: number
  dueDay: number
  active: boolean
}

export type AdminFinancialTransaction = {
  id: number
  type: 'INCOME' | 'EXPENSE'
  description: string
  value: string
  status: 'PLANNED' | 'PENDING' | 'PAID' | 'CANCELED'
  competenceDate: Date
  dueDate: Date
  paidAt: Date | null
  categoryName: string | null
  accountName: string | null
  creditCardName: string | null
}

export type AdminFinancialInvoice = {
  id: number
  month: number
  year: number
  status: 'OPEN' | 'PAID' | 'CANCELED'
  total: string
  dueDate: Date
  creditCardName: string | null
}

export type AdminFinancialGoal = {
  id: number
  name: string
  targetAmount: string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELED'
  reserveAccountId: number | null
}

export type AdminFinancialOverview = {
  user: AdminUserListItem
  summary: {
    accounts: number
    activeAccounts: number
    cards: number
    activeCards: number
    transactions: number
    plannedTransactions: number
    pendingTransactions: number
    paidTransactions: number
    canceledTransactions: number
    invoices: number
    goals: number
    activeGoals: number
    completedGoals: number
    canceledGoals: number
  }
  accounts: AdminFinancialAccount[]
  cards: AdminFinancialCard[]
  transactions: {
    total: number
    items: AdminFinancialTransaction[]
  }
  invoices: AdminFinancialInvoice[]
  goals: AdminFinancialGoal[]
}
