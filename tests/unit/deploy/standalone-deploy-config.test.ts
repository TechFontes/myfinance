import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'
import nextConfig from '../../../next.config'

const require = createRequire(import.meta.url)

describe('standalone deploy configuration', () => {
  it('builds Next.js with standalone output for PM2 startup files', () => {
    expect(nextConfig.output).toBe('standalone')
    expect(nextConfig.turbopack?.root).toBe(path.resolve(process.cwd()))
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
      expect(path.normalize(app.script)).toContain('start-standalone.cjs')
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

    expect(packageJson.scripts['start:standalone']).toBe('node start-standalone.cjs')
  })

  it('provides a root startup wrapper that loads .env before requiring the standalone server', () => {
    const wrapperPath = path.resolve(process.cwd(), 'start-standalone.cjs')

    expect(fs.existsSync(wrapperPath)).toBe(true)

    const wrapper = require('../../../start-standalone.cjs')
    const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'myfinance-standalone-'))
    const fixtureEnvPath = path.join(fixtureDir, '.env')

    fs.writeFileSync(fixtureEnvPath, 'PORT=3020\nHOSTNAME=127.0.0.1\n')

    const originalPort = process.env.PORT
    const originalHostname = process.env.HOSTNAME

    delete process.env.PORT
    delete process.env.HOSTNAME

    try {
      const runtime = wrapper.loadStandaloneRuntime(fixtureDir)

      expect(runtime.serverPath).toBe(
        path.join(fixtureDir, '.next', 'standalone', 'server.js'),
      )
      expect(process.env.PORT).toBe('3020')
      expect(process.env.HOSTNAME).toBe('127.0.0.1')
    } finally {
      if (originalPort === undefined) {
        delete process.env.PORT
      } else {
        process.env.PORT = originalPort
      }

      if (originalHostname === undefined) {
        delete process.env.HOSTNAME
      } else {
        process.env.HOSTNAME = originalHostname
      }

      fs.rmSync(fixtureDir, { recursive: true, force: true })
    }
  })

  it('prepares the standalone bundle with static and public assets after build', () => {
    const packageJson = require('../../../package.json')

    expect(packageJson.scripts.build).toBe('next build && node scripts/prepare-standalone.mjs')
    expect(fs.existsSync(path.resolve(process.cwd(), 'scripts/prepare-standalone.mjs'))).toBe(true)
  })
})
