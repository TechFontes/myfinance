import path from 'node:path'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'
import nextConfig from '../../../next.config'

const require = createRequire(import.meta.url)

describe('standalone deploy configuration', () => {
  it('builds Next.js with standalone output for containerized deployment', () => {
    expect(nextConfig.output).toBe('standalone')
    expect(nextConfig.turbopack?.root).toBe(path.resolve(process.cwd()))
  })

  it('provides a Dockerfile for multi-stage container build', () => {
    const dockerfilePath = path.resolve(process.cwd(), 'Dockerfile')
    expect(fs.existsSync(dockerfilePath)).toBe(true)

    const content = fs.readFileSync(dockerfilePath, 'utf-8')
    expect(content).toContain('FROM node:20-alpine')
    expect(content).toContain('yarn build')
    expect(content).toContain('server.js')
  })

  it('provides Kubernetes manifests for K3s deployment', () => {
    const k8sDir = path.resolve(process.cwd(), 'k8s')
    expect(fs.existsSync(path.join(k8sDir, 'namespace.yaml'))).toBe(true)
    expect(fs.existsSync(path.join(k8sDir, 'deployment.yaml'))).toBe(true)
    expect(fs.existsSync(path.join(k8sDir, 'service.yaml'))).toBe(true)
    expect(fs.existsSync(path.join(k8sDir, 'secret.yaml'))).toBe(true)
  })

  it('prepares the standalone bundle with static and public assets after build', () => {
    const packageJson = require('../../../package.json')

    expect(packageJson.scripts.build).toBe('next build && node scripts/prepare-standalone.mjs')
    expect(fs.existsSync(path.resolve(process.cwd(), 'scripts/prepare-standalone.mjs'))).toBe(true)
  })

  it('provides a .dockerignore to optimize build context', () => {
    const dockerignorePath = path.resolve(process.cwd(), '.dockerignore')
    expect(fs.existsSync(dockerignorePath)).toBe(true)

    const content = fs.readFileSync(dockerignorePath, 'utf-8')
    expect(content).toContain('node_modules')
    expect(content).toContain('.next')
    expect(content).toContain('.env')
  })
})
