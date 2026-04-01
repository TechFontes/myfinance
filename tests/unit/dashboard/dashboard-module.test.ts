import { describe, expect, it } from 'vitest'
import * as dashboard from '@/modules/dashboard'

describe('dashboard module entrypoint', () => {
  it('exports the dashboard contract surface', () => {
    expect(dashboard).toBeDefined()
    expect(dashboard.dashboardSections).toBeDefined()
  })
})
