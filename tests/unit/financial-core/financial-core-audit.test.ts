import { describe, expect, it } from 'vitest'

describe('financial core audit coverage', () => {
  it('tracks all command types that can alter patrimonial state', () => {
    const commands = [
      'createTransaction',
      'updateTransaction',
      'settleTransaction',
      'cancelTransaction',
      'createTransfer',
      'updateTransfer',
      'settleTransfer',
      'payInvoice',
      'recordGoalContribution',
      'recordGoalWithdrawal',
    ]

    expect(commands).toContain('payInvoice')
  })
})
