import type { CsvImportCategoryMapping, CsvImportPossibleDuplicate } from './contracts'

export type CsvImportParsedRow = Record<string, string>

export type CsvImportParsedText = {
  headers: string[]
  rows: CsvImportParsedRow[]
}

export type CsvImportIssueCode =
  | 'missing_field'
  | 'invalid_value'
  | 'invalid_date'
  | 'missing_category'
  | 'duplicate_row'
  | 'invalid_row'

export type CsvImportRowIssue = {
  code: CsvImportIssueCode
  field?: string
  message: string
}

export type CsvImportPreviewRow = {
  line: number
  transaction: {
    type: 'INCOME' | 'EXPENSE'
    description: string
    value: string
    categoryName: string
    competenceDate: string
    dueDate: string
    paidAt?: string | null
    accountName?: string | null
    creditCardName?: string | null
    status: 'PLANNED' | 'PENDING' | 'PAID' | 'CANCELED'
    fixed: boolean
    installment?: number | null
    installments?: number | null
  }
  mappedCategoryId?: number | null
  readyToPersist: boolean
  issues: CsvImportRowIssue[]
}

export type CsvImportPreviewSummary = {
  totalRows: number
  readyRows: number
  invalidRows: number
  missingCategoryRows: number
  duplicateRows: number
}

export type CsvImportTransactionPreview = {
  rows: CsvImportPreviewRow[]
  validRows: CsvImportPreviewRow[]
  invalidRows: CsvImportPreviewRow[]
  summary: CsvImportPreviewSummary
  possibleDuplicates: CsvImportPossibleDuplicate[]
  pendingCategoryMappings: CsvImportCategoryMapping[]
  readyToCommit: boolean
}

function parseCsvCellList(line: string) {
  const cells: string[] = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const nextChar = line[index + 1]

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"'
        index += 1
        continue
      }

      if (char === '"') {
        inQuotes = false
        continue
      }

      current += char
      continue
    }

    if (char === ',') {
      cells.push(current.trim())
      current = ''
      continue
    }

    if (char === '"') {
      inQuotes = true
      continue
    }

    current += char
  }

  cells.push(current.trim())
  return cells
}

function normalizeLineBreaks(text: string) {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

function parseBoolean(value: string | undefined) {
  if (!value) {
    return false
  }

  return ['true', '1', 'yes', 'sim'].includes(value.trim().toLowerCase())
}

function parseOptionalNumber(value: string | undefined) {
  if (!value || !value.trim()) {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeOptionalText(value: string | undefined) {
  if (!value) {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeRequiredText(value: string | undefined) {
  return (value ?? '').trim()
}

function normalizeComparableText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function isValidDate(value: string) {
  if (!value) {
    return false
  }

  const parsed = new Date(value)
  return !Number.isNaN(parsed.getTime())
}

function buildMissingFieldIssue(field: string, message: string): CsvImportRowIssue {
  return {
    code: 'missing_field',
    field,
    message,
  }
}

function buildInvalidValueIssue(field: string, message: string): CsvImportRowIssue {
  return {
    code: 'invalid_value',
    field,
    message,
  }
}

function buildInvalidDateIssue(field: string, message: string): CsvImportRowIssue {
  return {
    code: 'invalid_date',
    field,
    message,
  }
}

function findCategoryId(
  categoryName: string,
  categories: Array<{ id: number; name: string }>,
) {
  const normalized = normalizeComparableText(categoryName)

  return (
    categories.find((category) => normalizeComparableText(category.name) === normalized)?.id ??
    null
  )
}

function buildCategorySuggestions(
  categoryName: string,
  categories: Array<{ id: number; name: string }>,
) {
  const normalizedCategoryName = normalizeComparableText(categoryName)

  if (!normalizedCategoryName) {
    return []
  }

  return categories
    .filter((category) => {
      const normalizedCandidate = normalizeComparableText(category.name)
      return (
        normalizedCandidate.includes(normalizedCategoryName) ||
        normalizedCategoryName.includes(normalizedCandidate)
      )
    })
    .map((category) => category.id)
}

function buildSignature(transaction: CsvImportTransactionPreview['rows'][number]['transaction']) {
  return [
    transaction.type,
    normalizeComparableText(transaction.description),
    transaction.value.trim(),
    transaction.competenceDate,
    transaction.dueDate,
  ].join('|')
}

export function parseCsvImportText(text: string): CsvImportParsedText {
  const normalizedText = normalizeLineBreaks(text).trim()

  if (!normalizedText) {
    return { headers: [], rows: [] }
  }

  const lines = normalizedText.split('\n').filter((line) => line.trim().length > 0)

  if (lines.length === 0) {
    return { headers: [], rows: [] }
  }

  const headers = parseCsvCellList(lines[0] ?? '')
  const rows = lines.slice(1).map((line) => {
    const cells = parseCsvCellList(line)
    return headers.reduce<CsvImportParsedRow>((row, header, index) => {
      row[header] = cells[index] ?? ''
      return row
    }, {})
  })

  return { headers, rows }
}

export function buildTransactionImportPreview(
  text: string,
  categories: Array<{ id: number; name: string }>,
  duplicateSignatures: string[] = [],
): CsvImportTransactionPreview {
  const parsed = parseCsvImportText(text)
  const duplicateSignatureSet = new Set(duplicateSignatures)
  const pendingCategoryMap = new Map<string, CsvImportCategoryMapping>()
  const possibleDuplicates: CsvImportPossibleDuplicate[] = []

  const preparedRows = parsed.rows.map((rawRow, rowIndex) => {
    const line = rowIndex + 2
    const normalizedType = normalizeRequiredText(rawRow.type).toUpperCase()
    const type = (['INCOME', 'EXPENSE'].includes(normalizedType)
      ? normalizedType
      : 'EXPENSE') as 'INCOME' | 'EXPENSE'
    const description = normalizeRequiredText(rawRow.description)
    const value = normalizeRequiredText(rawRow.value)
    const categoryName = normalizeRequiredText(rawRow.categoryName ?? rawRow.category)
    const competenceDate = normalizeRequiredText(rawRow.competenceDate)
    const dueDate = normalizeRequiredText(rawRow.dueDate)
    const paidAt = normalizeOptionalText(rawRow.paidAt)
    const accountName = normalizeOptionalText(rawRow.accountName)
    const creditCardName = normalizeOptionalText(rawRow.creditCardName)
    const status = (normalizeRequiredText(rawRow.status).toUpperCase() || 'PLANNED') as
      | 'PLANNED'
      | 'PENDING'
      | 'PAID'
      | 'CANCELED'
    const fixed = parseBoolean(rawRow.fixed)
    const installment = parseOptionalNumber(rawRow.installment)
    const installments = parseOptionalNumber(rawRow.installments)

    const transaction = {
      type,
      description,
      value,
      categoryName,
      competenceDate,
      dueDate,
      paidAt,
      accountName,
      creditCardName,
      status,
      fixed,
      installment,
      installments,
    }

    const issues: CsvImportRowIssue[] = []
    const mappedCategoryId = categoryName ? findCategoryId(categoryName, categories) : null

    if (!categoryName) {
      issues.push({
        code: 'missing_category',
        field: 'categoryName',
        message: 'Category is required before persisting the import',
      })
    } else if (mappedCategoryId === null) {
      issues.push({
        code: 'missing_category',
        field: 'categoryName',
        message: 'Category needs mapping before persisting the import',
      })

      const existingMapping = pendingCategoryMap.get(categoryName)
      if (!existingMapping) {
        pendingCategoryMap.set(categoryName, {
          sourceName: categoryName,
          needsMapping: true,
          suggestedCategoryIds: buildCategorySuggestions(categoryName, categories),
        })
      }
    }

    if (!normalizeRequiredText(rawRow.type)) {
      issues.push(buildMissingFieldIssue('type', 'type is required'))
    } else if (!['INCOME', 'EXPENSE'].includes(normalizedType)) {
      issues.push(buildInvalidValueIssue('type', 'type must be INCOME or EXPENSE'))
    }

    if (!description) {
      issues.push(buildMissingFieldIssue('description', 'description is required'))
    }

    if (!value) {
      issues.push(buildMissingFieldIssue('value', 'value is required'))
    } else if (Number.isNaN(Number(value))) {
      issues.push(buildInvalidValueIssue('value', 'value must be numeric'))
    }

    if (!competenceDate) {
      issues.push(buildMissingFieldIssue('competenceDate', 'competenceDate is required'))
    } else if (!isValidDate(competenceDate)) {
      issues.push(buildInvalidDateIssue('competenceDate', 'competenceDate must be a valid date'))
    }

    if (!dueDate) {
      issues.push(buildMissingFieldIssue('dueDate', 'dueDate is required'))
    } else if (!isValidDate(dueDate)) {
      issues.push(buildInvalidDateIssue('dueDate', 'dueDate must be a valid date'))
    }

    if (rawRow.installment !== undefined && installment === null) {
      issues.push(buildInvalidValueIssue('installment', 'installment must be numeric'))
    }

    if (rawRow.installments !== undefined && installments === null) {
      issues.push(buildInvalidValueIssue('installments', 'installments must be numeric'))
    }

    return {
      line,
      transaction,
      mappedCategoryId,
      issues,
    }
  })

  const signatureCounts = new Map<string, number>()
  preparedRows.forEach((row) => {
    const signature = buildSignature(row.transaction)
    signatureCounts.set(signature, (signatureCounts.get(signature) ?? 0) + 1)
  })

  const rows = preparedRows.map((row) => {
    const signature = buildSignature(row.transaction)
    const duplicateCount = signatureCounts.get(signature) ?? 0
    const matchesExistingSignature = duplicateSignatureSet.has(signature)
    const isDuplicate = duplicateCount > 1 || matchesExistingSignature
    const issues = [...row.issues]

    if (isDuplicate) {
      issues.push({
        code: 'duplicate_row',
        message: 'A possible duplicate transaction was detected',
      })

      possibleDuplicates.push({
        lineNumber: row.line,
        reason: matchesExistingSignature
          ? 'Transaction matches an existing signature'
          : 'Transaction appears more than once in the import',
      })
    }

    return {
      ...row,
      readyToPersist: issues.length === 0,
      issues,
    }
  })

  const pendingCategoryMappings = Array.from(pendingCategoryMap.values())
  const validRows = rows.filter((row) => row.readyToPersist)
  const invalidRows = rows.filter((row) => !row.readyToPersist)

  const summary = rows.reduce(
    (accumulator, row) => {
      accumulator.totalRows += 1

      if (row.readyToPersist) {
        accumulator.readyRows += 1
      } else {
        accumulator.invalidRows += 1
      }

      if (row.issues.some((issue) => issue.code === 'missing_category')) {
        accumulator.missingCategoryRows += 1
      }

      if (row.issues.some((issue) => issue.code === 'duplicate_row')) {
        accumulator.duplicateRows += 1
      }

      return accumulator
    },
    {
      totalRows: 0,
      readyRows: 0,
      invalidRows: 0,
      missingCategoryRows: 0,
      duplicateRows: 0,
    } as CsvImportPreviewSummary,
  )

  return {
    rows,
    validRows,
    invalidRows,
    summary,
    possibleDuplicates,
    pendingCategoryMappings,
    readyToCommit:
      summary.invalidRows === 0 &&
      pendingCategoryMappings.length === 0 &&
      possibleDuplicates.length === 0,
  }
}
