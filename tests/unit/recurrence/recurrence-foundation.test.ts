import { describe, expect, it } from 'vitest'
import {
  recurrenceFrequencies,
  recurrenceEditScopes,
  recurrenceStatuses,
  recurrenceTypes,
  recurrenceCreateSchema,
  recurrenceUpdateSchema,
} from '@/modules/recurrence'

describe('recurrence module foundation', () => {
  it('exports recurrence enums aligned with the PRD', () => {
    expect(recurrenceTypes).toEqual(['INCOME', 'EXPENSE'])
    expect(recurrenceStatuses).toEqual(['ACTIVE', 'INACTIVE'])
    expect(recurrenceFrequencies).toEqual(['MONTHLY'])
    expect(recurrenceEditScopes).toEqual(['THIS_OCCURRENCE', 'THIS_AND_FUTURE'])
  })

  it('validates recurrence creation payloads', () => {
    const payload = recurrenceCreateSchema.parse({
      type: 'EXPENSE',
      description: 'Academia',
      value: '120.00',
      categoryId: 12,
      accountId: 4,
      creditCardId: null,
      frequency: 'MONTHLY',
      dayOfMonth: 5,
      startDate: new Date('2026-03-01'),
      endDate: null,
      active: true,
    })

    expect(payload).toMatchObject({
      type: 'EXPENSE',
      description: 'Academia',
      value: '120.00',
      categoryId: 12,
      accountId: 4,
      creditCardId: null,
      frequency: 'MONTHLY',
      dayOfMonth: 5,
      active: true,
    })
  })

  it('validates recurrence updates with edit scope metadata', () => {
    const payload = recurrenceUpdateSchema.parse({
      id: 33,
      description: 'Academia premium',
      editScope: 'THIS_AND_FUTURE',
      active: false,
    })

    expect(payload).toMatchObject({
      id: 33,
      description: 'Academia premium',
      editScope: 'THIS_AND_FUTURE',
      active: false,
    })
  })
})
