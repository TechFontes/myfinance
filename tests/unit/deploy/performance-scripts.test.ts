import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)

describe('performance reports and scripts', () => {
  it('exposes explicit commands for baseline and reanalysis collection', () => {
    const packageJson = require('../../../package.json')

    expect(packageJson.scripts['perf:baseline']).toBe('node scripts/performance-baseline.mjs baseline')
    expect(packageJson.scripts['perf:reanalysis']).toBe('node scripts/performance-baseline.mjs reanalysis')
  })

  it('keeps the performance reports scaffolded in the repository', () => {
    expect(
      fs.existsSync(
        path.resolve(
          process.cwd(),
          'docs/superpowers/reports/2026-04-01-myfinance-performance-baseline.md',
        ),
      ),
    ).toBe(true)
    expect(
      fs.existsSync(
        path.resolve(
          process.cwd(),
          'docs/superpowers/reports/2026-04-01-myfinance-performance-reanalysis.md',
        ),
      ),
    ).toBe(true)
    expect(fs.existsSync(path.resolve(process.cwd(), 'scripts/performance-baseline.mjs'))).toBe(true)
  })
})
