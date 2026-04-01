import { z } from "zod"
import { transactionStatuses, transactionTypes } from "./contracts"

const positiveId = z.coerce.number().int().positive()

export const transactionCreateSchema = z.object({
  type: z.enum(transactionTypes),
  description: z.string().trim().min(1),
  value: z.string().trim().min(1),
  categoryId: positiveId,
  accountId: positiveId.optional().nullable(),
  creditCardId: positiveId.optional().nullable(),
  invoiceId: positiveId.optional().nullable(),
  competenceDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  paidAt: z.coerce.date().optional().nullable(),
  status: z.enum(transactionStatuses).default("PLANNED"),
  fixed: z.coerce.boolean().default(false),
  installment: z.coerce.number().int().positive().optional().nullable(),
  installments: z.coerce.number().int().positive().optional().nullable(),
})

export const transactionUpdateSchema = transactionCreateSchema.partial().extend({
  id: positiveId,
})

export const transactionFiltersSchema = z.object({
  search: z.string().trim().min(1).optional(),
  type: z.enum(transactionTypes).optional(),
  status: z.enum(transactionStatuses).optional(),
  categoryId: positiveId.optional(),
  accountId: positiveId.optional(),
  creditCardId: positiveId.optional(),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
})
