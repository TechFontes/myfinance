import { beforeEach, describe, expect, it, vi } from 'vitest'

const recurringRuleFindMany = vi.fn()
const recurringRuleCreate = vi.fn()
const recurringRuleFindFirst = vi.fn()
const recurringRuleUpdate = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    recurringRule: {
      findMany: recurringRuleFindMany,
      create: recurringRuleCreate,
      findFirst: recurringRuleFindFirst,
      update: recurringRuleUpdate,
    },
  },
}))

describe('recurrence service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists recurring rules for a user in description order', async () => {
    recurringRuleFindMany.mockResolvedValue([{ id: 2 }, { id: 1 }])

    const { listRecurringRulesByUser } = await import('@/modules/recurrence/service')
    await listRecurringRulesByUser('user-1')

    expect(recurringRuleFindMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { description: 'asc' },
      include: {
        category: true,
        account: true,
        creditCard: true,
      },
    })
  })

  it('creates recurrence rules with active defaulting to true', async () => {
    recurringRuleCreate.mockResolvedValue({ id: 1, active: true })

    const { createRecurringRuleForUser } = await import('@/modules/recurrence/service')
    await createRecurringRuleForUser('user-1', {
      type: 'EXPENSE',
      description: 'Academia',
      value: '120.00',
      categoryId: 7,
      frequency: 'MONTHLY',
      startDate: new Date('2026-03-10T00:00:00.000Z'),
    })

    expect(recurringRuleCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        active: true,
      }),
    })
  })

  it('generates a monthly planned occurrence inside the active range', async () => {
    const {
      buildRecurringEditScopePlan,
      generateMonthlyRecurringOccurrences,
    } = await import('@/modules/recurrence/service')

    const occurrences = generateMonthlyRecurringOccurrences(
      {
        id: 9,
        userId: 'user-1',
        type: 'EXPENSE',
        description: 'Academia',
        value: '120.00',
        categoryId: 7,
        accountId: 2,
        creditCardId: null,
        frequency: 'MONTHLY',
        dayOfMonth: 31,
        startDate: new Date('2026-03-10T00:00:00.000Z'),
        endDate: new Date('2026-05-31T00:00:00.000Z'),
        active: true,
      },
      2026,
      4,
    )

    expect(occurrences).toHaveLength(1)
    expect(occurrences[0]).toMatchObject({
      type: 'EXPENSE',
      description: 'Academia',
      value: '120.00',
      categoryId: 7,
      accountId: 2,
      creditCardId: null,
      recurringRuleId: 9,
      status: 'PLANNED',
      fixed: true,
      paidAt: null,
    })
    expect(occurrences[0].competenceDate.toISOString()).toBe('2026-04-30T00:00:00.000Z')
    expect(occurrences[0].dueDate.toISOString()).toBe('2026-04-30T00:00:00.000Z')
    expect(buildRecurringEditScopePlan('THIS_OCCURRENCE')).toEqual({
      editScope: 'THIS_OCCURRENCE',
      applyToFutureOccurrences: false,
    })
    expect(buildRecurringEditScopePlan('THIS_AND_FUTURE')).toEqual({
      editScope: 'THIS_AND_FUTURE',
      applyToFutureOccurrences: true,
    })
  })

  it('does not generate monthly occurrences outside the recurrence window', async () => {
    const { generateMonthlyRecurringOccurrences } = await import('@/modules/recurrence/service')

    const occurrences = generateMonthlyRecurringOccurrences(
      {
        id: 9,
        userId: 'user-1',
        type: 'EXPENSE',
        description: 'Academia',
        value: '120.00',
        categoryId: 7,
        accountId: null,
        creditCardId: null,
        frequency: 'MONTHLY',
        dayOfMonth: 10,
        startDate: new Date('2026-06-01T00:00:00.000Z'),
        endDate: new Date('2026-06-30T00:00:00.000Z'),
        active: true,
      },
      2026,
      5,
    )

    expect(occurrences).toEqual([])
  })
})
