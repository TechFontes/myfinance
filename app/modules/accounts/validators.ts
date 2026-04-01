import { z } from 'zod'
import { accountTypes } from './contracts'

const optionalTrimmedString = z.string().trim().min(1).optional()

export const accountCreateSchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(accountTypes),
  initialBalance: z.string().trim().min(1).optional(),
  institution: optionalTrimmedString,
  color: optionalTrimmedString,
  icon: optionalTrimmedString,
})

export const accountUpdateSchema = accountCreateSchema.partial().extend({
  active: z.boolean().optional(),
})
