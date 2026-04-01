export const importRowStatuses = ['VALID', 'INVALID'] as const
export const transactionImportTypes = ['TRANSACTION'] as const

export const csvImportFieldNames = [
  'type',
  'description',
  'value',
  'categoryName',
  'competenceDate',
  'dueDate',
  'paidAt',
  'accountName',
  'creditCardName',
  'status',
  'fixed',
  'installment',
  'installments',
] as const

export type ImportRowStatus = (typeof importRowStatuses)[number]
export type TransactionImportType = (typeof transactionImportTypes)[number]

export type CsvImportRow = {
  lineNumber: number
  type: 'INCOME' | 'EXPENSE'
  description: string
  value: string
  categoryName: string
  competenceDate: string
  dueDate: string
  paidAt?: string | null
  accountName?: string | null
  creditCardName?: string | null
  status?: 'PLANNED' | 'PENDING' | 'PAID' | 'CANCELED'
  fixed?: boolean
  installment?: number | null
  installments?: number | null
}

export type CsvImportInvalidRow = {
  lineNumber: number
  status: 'INVALID'
  raw: Partial<Record<(typeof csvImportFieldNames)[number], unknown>>
  errors: string[]
}

export type CsvImportPossibleDuplicate = {
  lineNumber: number
  reason: string
  matchedTransactionId?: number
  matchedAt?: string
}

export type CsvImportCategoryMapping = {
  sourceName: string
  needsMapping: boolean
  suggestedCategoryIds?: number[]
  mappedCategoryId?: number | null
}

export type CsvImportPreview = {
  sourceName: string
  totalRows: number
  validRows: number
  invalidRows: number
  readyToCommit: boolean
  rows: Array<CsvImportRow | CsvImportInvalidRow>
  possibleDuplicates: CsvImportPossibleDuplicate[]
  pendingCategoryMappings: CsvImportCategoryMapping[]
}

export type TransactionImportCategory = {
  id: number
  name: string
}

export type TransactionImportIssueCode =
  | 'missing_field'
  | 'invalid_value'
  | 'invalid_date'
  | 'missing_category'
  | 'duplicate_row'

export type TransactionImportIssue = {
  code: TransactionImportIssueCode
  field?: string
  message: string
}

export type TransactionImportRow = {
  line: number
  readyToPersist: boolean
  mappedCategoryId: number | null
  issues: TransactionImportIssue[]
  transaction: {
    type: 'INCOME' | 'EXPENSE'
    description: string
    value: string
    categoryName: string
    competenceDate: string
    dueDate: string
    status: 'PLANNED' | 'PENDING' | 'PAID' | 'CANCELED'
    fixed: boolean
    paidAt?: string | null
    accountName?: string | null
    creditCardName?: string | null
    installment?: number | null
    installments?: number | null
  }
}

export type TransactionImportSummary = {
  totalRows: number
  readyRows: number
  invalidRows: number
  missingCategoryRows: number
  duplicateRows: number
}

export type TransactionImportPreview = {
  sourceType: TransactionImportType
  headers: string[]
  summary: TransactionImportSummary
  rows: TransactionImportRow[]
  readyToPersist: boolean
}
