import { describe, expect, it } from 'vitest'
import {
  goalContributionModes,
  goalStatuses,
  goalsEditScopes,
} from '@/modules/goals/contracts'
import {
  goalsCreateSchema,
  goalsUpdateSchema,
  goalContributionSchema,
} from '@/modules/goals/validators'

describe('goals module foundation', () => {
  it('exports the expected enums for goals and contributions', () => {
    expect(goalStatuses).toEqual(['ACTIVE', 'COMPLETED', 'CANCELED'])
    expect(goalContributionModes).toEqual([
      'INFORMATION_ONLY',
      'TRANSFER_TO_RESERVE',
    ])
    expect(goalsEditScopes).toEqual(['THIS_GOAL', 'THIS_AND_FUTURE'])
  })

  it('validates goal creation payloads with PRD fields', () => {
    const payload = goalsCreateSchema.parse({
      name: 'Reserva de emergência',
      targetAmount: '10000.00',
      reserveAccountId: 7,
      status: 'ACTIVE',
      description: 'Meta para manter seis meses de custos',
    })

    expect(payload).toMatchObject({
      name: 'Reserva de emergência',
      targetAmount: '10000.00',
      reserveAccountId: 7,
      status: 'ACTIVE',
      description: 'Meta para manter seis meses de custos',
    })
  })

  it('validates goal updates with status and edit scope metadata', () => {
    const payload = goalsUpdateSchema.parse({
      id: 11,
      status: 'COMPLETED',
      editScope: 'THIS_AND_FUTURE',
    })

    expect(payload).toMatchObject({
      id: 11,
      status: 'COMPLETED',
      editScope: 'THIS_AND_FUTURE',
    })
  })

  it('validates goal contribution payloads with optional financial reflection', () => {
    const payload = goalContributionSchema.parse({
      goalId: 11,
      amount: '250.00',
      mode: 'TRANSFER_TO_RESERVE',
      note: 'aporte manual de março',
    })

    expect(payload).toMatchObject({
      goalId: 11,
      amount: '250.00',
      mode: 'TRANSFER_TO_RESERVE',
      note: 'aporte manual de março',
    })
  })
})
