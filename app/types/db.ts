import type {
  AccountType,
  CategoryType,
  TransactionStatus,
} from '@/types/domain'

type TransactionType = 'INCOME' | 'EXPENSE'

export type DBUser = {
  id: string
  name: string | null
  email: string
  password: string
  resetToken: string | null
  resetTokenExpiry: Date | null
  role: 'USER' | 'ADMIN'
  blockedAt: Date | null
  blockedReason: string | null
  createdAt: Date
  updatedAt: Date
}

export type DBAccount = {
  id: number
  userId: string
  name: string
  type: AccountType
  initialBalance: string
  active: boolean
  institution: string | null
  color: string | null
  icon: string | null
  createdAt: Date
  updatedAt: Date
}

export type DBCategory = {
  id: number
  userId: string
  name: string
  type: CategoryType
  parentId: number | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export type DBCreditCard = {
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
  updatedAt: Date
}

export type DBCreditCardInvoice = {
  id: number
  creditCardId: number
  month: number
  year: number
  dueDate: Date
  total: string
  status: 'OPEN' | 'PAID' | 'CANCELED'
  createdAt: Date
  updatedAt: Date
}

export type DBTransaction = {
  id: number
  userId: string
  type: TransactionType
  status: TransactionStatus
  value: string
  competenceDate: Date
  dueDate: Date
  paidAt: Date | null
  description: string
  categoryId: number
  accountId: number | null
  creditCardId: number | null
  invoiceId: number | null
  fixed: boolean
  installment: number | null
  installments: number | null
  recurringRuleId: number | null
  createdAt: Date
  updatedAt: Date
}

export type DBRecurringTransaction = {
  id: number
  userId: string
  type: TransactionType
  status: 'ACTIVE' | 'INACTIVE'
  value: string
  description: string
  categoryId: number
  accountId: number | null
  creditCardId: number | null
  frequency: 'MONTHLY'
  dayOfMonth: number | null
  startDate: Date
  endDate: Date | null
  createdAt: Date
  updatedAt: Date
}

export type TransactionWithRelations = DBTransaction & {
  user?: DBUser | null
  category?: DBCategory | null
  account?: DBAccount | null
  creditCard?: DBCreditCard | null
  invoice?: DBCreditCardInvoice | null
}

export type InvoiceWithRelations = DBCreditCardInvoice & {
  creditCard: DBCreditCard
  transactions: DBTransaction[]
}

export type RecurringTransactionWithRelations = DBRecurringTransaction & {
  user: DBUser
  category: DBCategory
  account?: DBAccount | null
  creditCard?: DBCreditCard | null
  transactions: DBTransaction[]
}

export interface CreateTransactionDTO {
  type: TransactionType
  status?: TransactionStatus
  value: string
  competenceDate: Date | string
  dueDate: Date | string
  paidAt?: Date | string | null
  description: string
  categoryId: number
  userId: string
  accountId?: number | null
  creditCardId?: number | null
  invoiceId?: number | null
  fixed?: boolean
  installment?: number | null
  installments?: number | null
}

export interface UpdateTransactionDTO {
  id: number
  value?: string
  description?: string
  competenceDate?: string | Date
  dueDate?: string | Date
  paidAt?: string | Date | null
  status?: TransactionStatus
  categoryId?: number
  accountId?: number | null
  creditCardId?: number | null
  invoiceId?: number | null
  fixed?: boolean
  installment?: number | null
  installments?: number | null
}

export interface CreateAccountDTO {
  userId: string
  name: string
  type: AccountType
  balance?: number
}

export interface CreateCategoryDTO {
  userId: string
  name: string
  type: CategoryType
}

export interface CreateInvoiceDTO {
  creditCardId: number
  month: number
  year: number
  dueDate: string | Date
  amount?: number
}

export interface CreateRecurringTransactionDTO {
  userId: string
  type: TransactionType
  categoryId: number
  amount: number
  description: string
  frequency: string
  dayOfMonth?: number
  startDate: string | Date
  endDate?: string | Date | null
  accountId?: number | null
  creditCardId?: number | null
}

export interface TransactionFilters {
  search?: string
  type?: TransactionType | 'ALL'
  status?: TransactionStatus
  categoryId?: number
  accountId?: number
  creditCardId?: number
  periodStart?: Date | string
  periodEnd?: Date | string
  page?: number
  pageSize?: number
}

export interface FinanceSummary {
  totalIncome: number
  totalExpense: number
  balance: number
  monthIncome: number
  monthExpense: number
}

export interface MonthlyCategorySummary {
  category: string
  total: number
  type: CategoryType
}

export interface AccountSummary {
  id: number
  name: string
  type: AccountType
  balance: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export type TransactionListResponse = ApiResponse<TransactionWithRelations[]>
export type TransactionResponse = ApiResponse<TransactionWithRelations>
export type AccountListResponse = ApiResponse<AccountSummary[]>
export type CategoryListResponse = ApiResponse<DBCategory[]>
