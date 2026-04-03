import { z } from 'zod'

const positiveDayOfMonth = z.coerce.number().int().min(1).max(31)
const optionalVisualField = z.preprocess(
  (val) => (typeof val === 'string' && val.trim().length === 0 ? undefined : val),
  z.string().trim().min(1).optional().nullable(),
)

export const cardCreateSchema = z.object({
  name: z.string().trim().min(1),
  limit: z.string().trim().min(1),
  closeDay: positiveDayOfMonth,
  dueDay: positiveDayOfMonth,
  color: optionalVisualField,
  icon: optionalVisualField,
  active: z.coerce.boolean().default(true),
})

export const cardUpdateSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: z.string().trim().min(1).optional(),
  limit: z.string().trim().min(1).optional(),
  closeDay: positiveDayOfMonth.optional(),
  dueDay: positiveDayOfMonth.optional(),
  color: optionalVisualField,
  icon: optionalVisualField,
  active: z.coerce.boolean().optional(),
})
