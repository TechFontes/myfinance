import { z } from 'zod'
import {
  recurrenceEditScopes,
  recurrenceFrequencies,
  recurrenceTypes,
} from './contracts'

const positiveId = z.coerce.number().int().positive()

export const recurrenceCreateSchema = z.object({
  type: z.enum(recurrenceTypes),
  description: z.string().trim().min(1),
  value: z.string().trim().min(1),
  categoryId: positiveId,
  accountId: positiveId.optional().nullable(),
  creditCardId: positiveId.optional().nullable(),
  frequency: z.enum(recurrenceFrequencies),
  dayOfMonth: z.coerce.number().int().positive().optional().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  active: z.boolean().default(true),
})

export const recurrenceUpdateSchema = z.object({
  id: positiveId,
  type: z.enum(recurrenceTypes).optional(),
  description: z.string().trim().min(1).optional(),
  value: z.string().trim().min(1).optional(),
  categoryId: positiveId.optional(),
  accountId: positiveId.optional().nullable(),
  creditCardId: positiveId.optional().nullable(),
  frequency: z.enum(recurrenceFrequencies).optional(),
  dayOfMonth: z.coerce.number().int().positive().optional().nullable(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  active: z.boolean().optional(),
  editScope: z.enum(recurrenceEditScopes).optional(),
})
