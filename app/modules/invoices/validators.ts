import { z } from 'zod'
import { invoiceStatuses } from './contracts'

const positiveId = z.coerce.number().int().positive()

export const invoiceCreateSchema = z.object({
  creditCardId: positiveId,
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000),
  dueDate: z.coerce.date(),
  status: z.enum(invoiceStatuses).default('OPEN'),
  total: z.string().trim().min(1).default('0.00'),
})

export const invoiceUpdateSchema = invoiceCreateSchema.partial().extend({
  id: positiveId,
})

export const installmentPlanSchema = z.object({
  installmentGroupId: z.string().trim().min(1),
  installment: z.coerce.number().int().positive(),
  installments: z.coerce.number().int().positive(),
}).refine((value) => value.installment <= value.installments, {
  message: 'Installment number must not exceed total installments',
  path: ['installment'],
})
