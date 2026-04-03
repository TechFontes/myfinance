import { z } from "zod"

export const loginInputSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

export const registerInputSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
})

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(8).optional(),
  confirmPassword: z.string().min(1).optional(),
}).refine(
  (data) => !data.newPassword || data.currentPassword,
  { message: 'Current password required to set new password', path: ['currentPassword'] },
).refine(
  (data) => !data.newPassword || data.confirmPassword,
  { message: 'Password confirmation is required', path: ['confirmPassword'] },
).refine(
  (data) => !data.newPassword || !data.confirmPassword || data.newPassword === data.confirmPassword,
  { message: 'Password confirmation does not match', path: ['confirmPassword'] },
).refine(
  (data) => !data.email || data.currentPassword,
  { message: 'Current password required to change email', path: ['currentPassword'] },
)
