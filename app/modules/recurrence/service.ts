import { prisma } from '@/lib/prisma'
import type {
  ProjectedRecurringOccurrence,
  RecurrenceCreateInput,
  RecurrenceFrequency,
  RecurrenceUpdateInput,
  RecurrenceEditScope,
} from './contracts'

type RecurrenceRuleLike = {
  id: number
  userId: string
  type: 'INCOME' | 'EXPENSE'
  description: string
  value: string
  categoryId: number
  accountId: number | null
  creditCardId: number | null
  frequency: RecurrenceFrequency
  dayOfMonth: number | null
  startDate: Date
  endDate: Date | null
  active: boolean
}

function toDate(input: Date | string): Date {
  return input instanceof Date ? input : new Date(input)
}

function normalizeUtcDate(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

function buildMonthlyOccurrenceDate(year: number, month: number, day: number): Date {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return new Date(Date.UTC(year, month - 1, Math.min(day, lastDay)))
}

function isWithinRange(date: Date, start: Date, end: Date): boolean {
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime()
}

export async function listRecurringRulesByUser(userId: string) {
  return prisma.recurringRule.findMany({
    where: { userId },
    orderBy: { description: 'asc' },
    include: {
      category: true,
      account: true,
      creditCard: true,
    },
  })
}

export async function createRecurringRuleForUser(
  userId: string,
  input: RecurrenceCreateInput,
) {
  return prisma.recurringRule.create({
    data: {
      userId,
      type: input.type,
      description: input.description,
      value: input.value,
      categoryId: input.categoryId,
      accountId: input.accountId ?? null,
      creditCardId: input.creditCardId ?? null,
      frequency: input.frequency,
      dayOfMonth: input.dayOfMonth ?? null,
      startDate: toDate(input.startDate),
      endDate: input.endDate ? toDate(input.endDate) : null,
      active: input.active ?? true,
    },
  })
}

export async function updateRecurringRuleForUser(
  userId: string,
  ruleId: number,
  input: RecurrenceUpdateInput,
) {
  const rule = await prisma.recurringRule.findFirst({
    where: { id: ruleId, userId },
  })

  if (!rule) {
    return null
  }

  return prisma.recurringRule.update({
    where: { id: ruleId },
    data: {
      type: input.type,
      description: input.description,
      value: input.value,
      categoryId: input.categoryId,
      accountId: input.accountId,
      creditCardId: input.creditCardId,
      frequency: input.frequency,
      dayOfMonth: input.dayOfMonth,
      startDate: input.startDate ? toDate(input.startDate) : undefined,
      endDate: input.endDate === undefined ? undefined : input.endDate ? toDate(input.endDate) : null,
      active: input.active,
    },
  })
}

export function projectRecurringOccurrences(
  rule: RecurrenceRuleLike,
  rangeStart: Date,
  rangeEnd: Date,
): ProjectedRecurringOccurrence[] {
  if (!rule.active || rule.frequency !== 'MONTHLY') {
    return []
  }

  const start = normalizeUtcDate(rangeStart)
  const end = normalizeUtcDate(rangeEnd)
  const ruleStart = normalizeUtcDate(rule.startDate)
  const ruleEnd = rule.endDate ? normalizeUtcDate(rule.endDate) : null
  const occurrenceDay = rule.dayOfMonth ?? rule.startDate.getUTCDate()
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1))
  const occurrences: ProjectedRecurringOccurrence[] = []

  while (cursor.getTime() <= end.getTime()) {
    const occurrenceDate = buildMonthlyOccurrenceDate(
      cursor.getUTCFullYear(),
      cursor.getUTCMonth() + 1,
      occurrenceDay,
    )

    if (
      isWithinRange(occurrenceDate, start, end) &&
      occurrenceDate.getTime() >= ruleStart.getTime() &&
      (!ruleEnd || occurrenceDate.getTime() <= ruleEnd.getTime())
    ) {
      occurrences.push({
        userId: rule.userId,
        recurringRuleId: rule.id,
        type: rule.type,
        description: rule.description,
        value: rule.value,
        categoryId: rule.categoryId,
        accountId: rule.accountId,
        creditCardId: rule.creditCardId,
        invoiceId: null,
        competenceDate: occurrenceDate,
        dueDate: occurrenceDate,
        paidAt: null,
        status: 'PLANNED',
        fixed: true,
        installmentGroupId: null,
        installment: null,
        installments: null,
      })
    }

    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }

  return occurrences
}

export function generateMonthlyRecurringOccurrences(
  rule: RecurrenceRuleLike,
  year: number,
  month: number,
) {
  const rangeStart = new Date(Date.UTC(year, month - 1, 1))
  const rangeEnd = new Date(Date.UTC(year, month, 0))

  return projectRecurringOccurrences(rule, rangeStart, rangeEnd)
}

export function buildRecurringEditScopePlan(editScope: RecurrenceEditScope) {
  return {
    editScope,
    applyToFutureOccurrences: editScope === 'THIS_AND_FUTURE',
  }
}

export function buildRecurringEditScope(editScope: RecurrenceEditScope) {
  return buildRecurringEditScopePlan(editScope)
}
