import { z } from 'zod'
import { categoryTypes } from './contracts'

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(categoryTypes),
  parentId: z.number().int().positive().optional(),
})

export const categoryUpdateSchema = categoryCreateSchema.partial().extend({
  active: z.boolean().optional(),
})
