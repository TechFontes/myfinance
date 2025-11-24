import {
  User,
  Account,
  Category,
  CreditCard,
  Invoice,
  Transaction,
  RecurringRule,
  TransactionType,
  TransactionStatus,
  AccountType,
  CategoryType,
  Prisma
} from "@prisma/client";

// ===============================
// BASE TYPES (Direto do Prisma)
// ===============================

export type DBUser = User;
export type DBAccount = Account;
export type DBCategory = Category;
export type DBCreditCard = CreditCard;
export type DBCreditCardInvoice = Invoice;
export type DBTransaction = Transaction;
export type DBRecurringTransaction = RecurringRule;

// ===================================
// RELATION TYPES (Com joins/prisma)
// ===================================

// Transaction com category + account + invoice + user
export type TransactionWithRelations = Transaction & {
  user?: User | null;
  category?: Category | null;
  account?: Account | null;
  creditCard?: CreditCard | null;
  invoice?: Invoice | null;
};

// Invoice com cartão + transações
export type InvoiceWithRelations = Invoice & {
  creditCard: CreditCard;
  transactions: Transaction[];
};

// RecurringTransaction com category + account + user
export type RecurringTransactionWithRelations = RecurringRule & {
  user: User;
  category: Category;
  account?: Account | null;
  creditCard?: CreditCard | null;
  transactions: Transaction[];
};

// ===================================
// DTOs (Data Transfer Objects)
// ===================================

// Criar transação
export interface CreateTransactionDTO {
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  date: Date | string;
  description: string;
  categoryId: number;
  userId: number;
  accountId?: number | null;
  creditCardId?: number | null;
  invoiceId?: number | null;
}

// Atualizar transação
export interface UpdateTransactionDTO {
  id: number;
  amount?: number;
  description?: string;
  date?: string | Date;
  status?: TransactionStatus;
  categoryId?: number;
  accountId?: number | null;
  invoiceId?: number | null;
}

// Criar conta
export interface CreateAccountDTO {
  userId: number;
  name: string;
  type: AccountType;
  balance?: number;
}

// Criar categoria
export interface CreateCategoryDTO {
  userId: number;
  name: string;
  type: CategoryType;
}

// Criar fatura de cartão
export interface CreateInvoiceDTO {
  creditCardId: number;
  month: number;
  year: number;
  dueDate: string | Date;
  amount?: number;
}

// Criar transação recorrente
export interface CreateRecurringTransactionDTO {
  userId: number;
  type: TransactionType;
  categoryId: number;
  amount: number;
  description: string;
  frequency: string;
  dayOfMonth?: number;
  startDate: string | Date;
  endDate?: string | Date | null;
  accountId?: number | null;
  creditCardId?: number | null;
}

// ===================================
// FILTER TYPES
// ===================================

export interface TransactionFilters {
  search?: string;
  type?: TransactionType | "ALL";
  month?: string; // yyyy-mm
  categoryId?: number;
  accountId?: number;
  status?: TransactionStatus;
}

// ===================================
// SUMMARY TYPES (Dashboard)
// ===================================

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthIncome: number;
  monthExpense: number;
}

export interface MonthlyCategorySummary {
  category: string;
  total: number;
  type: CategoryType;
}

export interface AccountSummary {
  id: number;
  name: string;
  type: AccountType;
  balance: number;
}

// ===================================
// API RESPONSE TYPES
// ===================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type TransactionListResponse = ApiResponse<TransactionWithRelations[]>;
export type TransactionResponse = ApiResponse<TransactionWithRelations>;
export type AccountListResponse = ApiResponse<AccountSummary[]>;
export type CategoryListResponse = ApiResponse<Category[]>;
