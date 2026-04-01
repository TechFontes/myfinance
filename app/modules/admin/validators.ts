import { z } from 'zod'

const adminRoleSchema = z.enum(['USER', 'ADMIN'])

export const adminUserUpdateSchema = z
  .object({
    name: z.string().trim().min(1).nullable().optional(),
    email: z.string().trim().email().optional(),
    role: adminRoleSchema.optional(),
  })
  .refine(
    (payload) =>
      payload.name !== undefined || payload.email !== undefined || payload.role !== undefined,
    {
      message: 'At least one administrative field must be provided',
    },
  )

export const adminBlockUserSchema = z.object({
  reason: z.string().trim().min(1),
})
