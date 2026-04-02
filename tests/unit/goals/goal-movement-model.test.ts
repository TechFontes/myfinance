import { describe, expect, it } from 'vitest'

describe('goal movement model', () => {
  it('accepts contribution, withdrawal and adjustment kinds with positive amounts', async () => {
    const { goalMovementKinds } = await import('@/modules/goals/contracts')
    const { goalContributionSchema } = await import('@/modules/goals/validators')

    expect(goalMovementKinds).toEqual(['CONTRIBUTION', 'WITHDRAWAL', 'ADJUSTMENT'])

    expect(
      goalContributionSchema.parse({
        goalId: 7,
        amount: '250.00',
        kind: 'CONTRIBUTION',
        mode: 'TRANSFER_TO_RESERVE',
        counterpartAccountId: 2,
      }),
    ).toMatchObject({
      goalId: 7,
      amount: '250.00',
      kind: 'CONTRIBUTION',
      mode: 'TRANSFER_TO_RESERVE',
      counterpartAccountId: 2,
    })

    expect(
      goalContributionSchema.parse({
        goalId: 7,
        amount: '100.00',
        kind: 'WITHDRAWAL',
        mode: 'TRANSFER_FROM_RESERVE',
        counterpartAccountId: 3,
        movementDate: '2026-04-02',
      }),
    ).toMatchObject({
      goalId: 7,
      amount: '100.00',
      kind: 'WITHDRAWAL',
      mode: 'TRANSFER_FROM_RESERVE',
      counterpartAccountId: 3,
      movementDate: '2026-04-02',
    })

    expect(
      goalContributionSchema.parse({
        goalId: 7,
        amount: '15.00',
        kind: 'ADJUSTMENT',
      }),
    ).toMatchObject({
      goalId: 7,
      amount: '15.00',
      kind: 'ADJUSTMENT',
    })
  })

  it('rejects zero or negative goal movement amounts', async () => {
    const { goalContributionSchema } = await import('@/modules/goals/validators')

    expect(() =>
      goalContributionSchema.parse({
        goalId: 7,
        amount: '0',
        kind: 'CONTRIBUTION',
      }),
    ).toThrow(/positive/i)

    expect(() =>
      goalContributionSchema.parse({
        goalId: 7,
        amount: '-10.00',
        kind: 'WITHDRAWAL',
      }),
    ).toThrow(/positive/i)
  })

  it('rejects financial movements without the required counterparty account', async () => {
    const { goalContributionSchema } = await import('@/modules/goals/validators')

    expect(() =>
      goalContributionSchema.parse({
        goalId: 7,
        amount: '50.00',
        kind: 'CONTRIBUTION',
        mode: 'TRANSFER_TO_RESERVE',
      }),
    ).toThrow(/account/i)

    expect(() =>
      goalContributionSchema.parse({
        goalId: 7,
        amount: '50.00',
        kind: 'WITHDRAWAL',
        mode: 'TRANSFER_FROM_RESERVE',
      }),
    ).toThrow(/account/i)
  })

  it('derives goal progress from signed movement effects', async () => {
    const { deriveGoalCurrentAmount, getGoalMovementSignedAmount } = await import('@/modules/goals/service')

    expect(getGoalMovementSignedAmount({ amount: '250.00', kind: 'CONTRIBUTION' })).toBe('250.00')
    expect(getGoalMovementSignedAmount({ amount: '40.00', kind: 'WITHDRAWAL' })).toBe('-40.00')
    expect(getGoalMovementSignedAmount({ amount: '15.00', kind: 'ADJUSTMENT' })).toBe('15.00')

    expect(
      deriveGoalCurrentAmount([
        { amount: '250.00', kind: 'CONTRIBUTION' },
        { amount: '40.00', kind: 'WITHDRAWAL' },
        { amount: '15.00', kind: 'ADJUSTMENT' },
      ]),
    ).toBe('225.00')
  })
})
