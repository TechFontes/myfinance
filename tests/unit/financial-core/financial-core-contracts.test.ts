import { describe, it, expect } from 'vitest'
import {
  financialCommandNames,
  financialEffectTargets,
} from '@/modules/financial-core/contracts'

describe('financial core contracts', () => {
  it('includes cancel and settle commands in command names', () => {
    expect(financialCommandNames).toContain('cancelTransaction')
    expect(financialCommandNames).toContain('settleTransfer')
    expect(financialCommandNames).toContain('cancelTransfer')
    expect(financialCommandNames).toContain('recordGoalWithdrawal')
  })

  it('includes all effect targets', () => {
    expect(financialEffectTargets).toContain('transaction')
    expect(financialEffectTargets).toContain('transfer')
    expect(financialEffectTargets).toContain('invoice')
    expect(financialEffectTargets).toContain('goal')
    expect(financialEffectTargets).toContain('goal-contribution')
    expect(financialEffectTargets).toContain('account-balance')
    expect(financialEffectTargets).toContain('dashboard-read-model')
  })
})
