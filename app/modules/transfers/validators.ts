import { z } from 'zod'
import { transferStatuses } from './contracts'

export const transferCreateSchema = z.object({
  sourceAccountId: z.number().int().positive(),
  destinationAccountId: z.number().int().positive(),
  amount: z.string().trim().min(1),
  description: z.string().trim().min(1),
  competenceDate: z.string().trim().min(1),
  dueDate: z.string().trim().min(1),
})

export const transferUpdateSchema = transferCreateSchema.partial().extend({
  status: z.enum(transferStatuses).optional(),
  paidAt: z.string().trim().min(1).nullable().optional(),
})
