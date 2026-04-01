import path from 'node:path'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'
import nextConfig from '../../../next.config'

const require = createRequire(import.meta.url)

describe('standalone deploy configuration', () => {
  it('builds Next.js with standalone output for PM2 startup files', () => {
    expect(nextConfig.output).toBe('standalone')
  })

  it('provides a PM2 ecosystem file pointing to the standalone server entrypoint', () => {
    const ecosystemPath = require.resolve('../../../ecosystem.config.cjs')
    const originalPort = process.env.PORT

    process.env.PORT = '4310'
    delete require.cache[ecosystemPath]

    try {
      const ecosystem = require('../../../ecosystem.config.cjs')
      const app = Array.isArray(ecosystem.apps) ? ecosystem.apps[0] : ecosystem.apps

      expect(app).toBeDefined()
      expect(app.name).toBe('myfinance')
      expect(path.normalize(app.script)).toContain(
        path.join('.next', 'standalone', 'server.js'),
      )
      expect(app.exec_mode).toBe('fork')
      expect(app.env.PORT).toBe('4310')
      expect(app.env.HOSTNAME).toBe('0.0.0.0')
    } finally {
      if (originalPort === undefined) {
        delete process.env.PORT
      } else {
        process.env.PORT = originalPort
      }
      delete require.cache[ecosystemPath]
    }
  })

  it('exposes a direct standalone startup script for operational parity outside PM2', () => {
    const packageJson = require('../../../package.json')

    expect(packageJson.scripts['start:standalone']).toBe('node .next/standalone/server.js')
  })

  it('prepares the standalone bundle with static and public assets after build', () => {
    const packageJson = require('../../../package.json')

    expect(packageJson.scripts.build).toBe('next build && node scripts/prepare-standalone.mjs')
    expect(fs.existsSync(path.resolve(process.cwd(), 'scripts/prepare-standalone.mjs'))).toBe(true)
  })
})
