import { describe, expect, it } from 'vitest'
import {
  dashboardPeriodModes,
  dashboardSections,
} from '@/modules/dashboard'

describe('dashboard contract', () => {
  it('exposes the selectable period mode and report sections required by the PRD', () => {
    expect(dashboardPeriodModes).toEqual(['MONTHLY'])
    expect(dashboardSections).toEqual([
      'summary',
      'pending',
      'accounts',
      'categories',
      'cardInvoices',
      'transfers',
    ])
  })
})
