import { z } from 'zod'
import {
  csvImportFieldNames,
  importRowStatuses,
  transactionImportTypes,
} from './contracts'

const positiveLineNumber = z.coerce.number().int().positive()

const csvImportBaseRowSchema = z.object({
  lineNumber: positiveLineNumber,
  type: z.enum(['INCOME', 'EXPENSE']),
  description: z.string().trim().min(1),
  value: z.string().trim().min(1),
  categoryName: z.string().trim().min(1),
  competenceDate: z.string().trim().min(1),
  dueDate: z.string().trim().min(1),
  paidAt: z.string().trim().min(1).nullable().optional(),
  accountName: z.string().trim().min(1).nullable().optional(),
  creditCardName: z.string().trim().min(1).nullable().optional(),
  status: z.enum(['PLANNED', 'PENDING', 'PAID', 'CANCELED']).optional(),
  fixed: z.coerce.boolean().optional(),
  installment: z.coerce.number().int().positive().nullable().optional(),
  installments: z.coerce.number().int().positive().nullable().optional(),
})

export const csvImportRowSchema = csvImportBaseRowSchema

export const csvImportInvalidRowSchema = z.object({
  lineNumber: positiveLineNumber,
  status: z.literal('INVALID'),
  raw: z.record(z.string(), z.unknown()),
  errors: z.array(z.string().min(1)).min(1),
})

export const csvImportPossibleDuplicateSchema = z.object({
  lineNumber: positiveLineNumber,
  reason: z.string().trim().min(1),
  matchedTransactionId: z.number().int().positive().optional(),
  matchedAt: z.string().trim().min(1).optional(),
})

export const csvImportCategoryMappingSchema = z.object({
  sourceName: z.string().trim().min(1),
  needsMapping: z.boolean(),
  suggestedCategoryIds: z.array(z.number().int().positive()).optional(),
  mappedCategoryId: z.number().int().positive().nullable().optional(),
})

export const csvImportPreviewSchema = z.object({
  sourceName: z.string().trim().min(1),
  totalRows: z.number().int().nonnegative(),
  validRows: z.number().int().nonnegative(),
  invalidRows: z.number().int().nonnegative(),
  readyToCommit: z.boolean(),
  rows: z.array(z.union([csvImportRowSchema, csvImportInvalidRowSchema])),
  possibleDuplicates: z.array(csvImportPossibleDuplicateSchema),
  pendingCategoryMappings: z.array(csvImportCategoryMappingSchema),
}).refine((preview) => preview.validRows + preview.invalidRows === preview.totalRows, {
  message: 'Valid and invalid rows must add up to the total rows',
})

export const csvImportCommitSchema = z.object({
  previewToken: z.string().trim().min(1),
  acceptedDuplicateLineNumbers: z.array(positiveLineNumber).default([]),
  categoryMappings: z.array(csvImportCategoryMappingSchema).default([]),
})

export const csvImportFieldNameListSchema = z
  .array(z.enum(csvImportFieldNames))
  .refine((fields) => new Set(fields).size === fields.length, {
    message: 'CSV fields must be unique',
  })

export const csvImportRowStatusSchema = z.enum(importRowStatuses)

const transactionImportIssueCodeSchema = z.enum([
  'missing_field',
  'invalid_value',
  'invalid_date',
  'missing_category',
  'duplicate_row',
])

const transactionImportIssueSchema = z.object({
  code: transactionImportIssueCodeSchema,
  field: z.string().trim().min(1).optional(),
  message: z.string().trim().min(1),
})

const transactionImportRowSchema = z.object({
  line: positiveLineNumber,
  readyToPersist: z.boolean(),
  mappedCategoryId: z.number().int().positive().nullable(),
  issues: z.array(transactionImportIssueSchema),
  transaction: z.object({
    type: z.enum(['INCOME', 'EXPENSE']),
    description: z.string().trim().min(1),
    value: z.string().trim().min(1),
    categoryName: z.string().trim().min(1),
    competenceDate: z.string().trim().min(1),
    dueDate: z.string().trim().min(1),
    status: z.enum(['PLANNED', 'PENDING', 'PAID', 'CANCELED']),
    fixed: z.boolean(),
    paidAt: z.string().trim().min(1).nullable().optional(),
    accountName: z.string().trim().min(1).nullable().optional(),
    creditCardName: z.string().trim().min(1).nullable().optional(),
    installment: z.number().int().positive().nullable().optional(),
    installments: z.number().int().positive().nullable().optional(),
  }),
})

export const transactionImportPreviewSchema = z.object({
  sourceType: z.enum(transactionImportTypes),
  headers: z.array(z.string().trim()),
  summary: z.object({
    totalRows: z.number().int().nonnegative(),
    readyRows: z.number().int().nonnegative(),
    invalidRows: z.number().int().nonnegative(),
    missingCategoryRows: z.number().int().nonnegative(),
    duplicateRows: z.number().int().nonnegative(),
  }),
  rows: z.array(transactionImportRowSchema),
  readyToPersist: z.boolean(),
})
