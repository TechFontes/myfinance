import { z } from "zod"

export const loginInputSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
})

export const registerInputSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
})
