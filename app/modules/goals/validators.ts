import { z } from 'zod'
import { goalContributionModes, goalMovementKinds, goalStatuses, goalsEditScopes } from './contracts'

const positiveId = z.coerce.number().int().positive()
const moneyString = z
  .string()
  .trim()
  .min(1)
  .refine((value) => Number(value) > 0, 'Amount must be positive')
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
  kind: z.enum(goalMovementKinds).default('CONTRIBUTION'),
  mode: z.enum(goalContributionModes).default('INFORMATION_ONLY'),
  counterpartAccountId: positiveId.optional().nullable(),
  movementDate: z.string().trim().date().optional().nullable(),
  note: optionalNullableString,
}).superRefine((value, ctx) => {
  if (value.mode === 'TRANSFER_TO_RESERVE') {
    if (value.kind !== 'CONTRIBUTION') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['kind'],
        message: 'Reserve contributions must use CONTRIBUTION kind',
      })
    }

    if (value.counterpartAccountId == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['counterpartAccountId'],
        message: 'Counterparty account is required for financial goal movements',
      })
    }
  }

  if (value.mode === 'TRANSFER_FROM_RESERVE') {
    if (value.kind !== 'WITHDRAWAL') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['kind'],
        message: 'Reserve withdrawals must use WITHDRAWAL kind',
      })
    }

    if (value.counterpartAccountId == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['counterpartAccountId'],
        message: 'Counterparty account is required for financial goal movements',
      })
    }
  }
})
