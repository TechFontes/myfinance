import { z } from 'zod'
import { goalContributionModes, goalStatuses, goalsEditScopes } from './contracts'

const positiveId = z.coerce.number().int().positive()
const moneyString = z.string().trim().min(1)
const optionalNullableString = z.string().trim().min(1).optional().nullable()

export const goalsCreateSchema = z.object({
  name: z.string().trim().min(1),
  targetAmount: moneyString,
  reserveAccountId: positiveId.optional().nullable(),
  status: z.enum(goalStatuses).default('ACTIVE'),
  description: optionalNullableString,
})

export const goalsUpdateSchema = z.object({
  id: positiveId,
  name: z.string().trim().min(1).optional(),
  targetAmount: moneyString.optional(),
  reserveAccountId: positiveId.optional().nullable(),
  status: z.enum(goalStatuses).optional(),
  description: optionalNullableString,
  editScope: z.enum(goalsEditScopes).optional(),
})

export const goalContributionSchema = z.object({
  goalId: positiveId,
  amount: moneyString,
  mode: z.enum(goalContributionModes).default('INFORMATION_ONLY'),
  note: optionalNullableString,
})
