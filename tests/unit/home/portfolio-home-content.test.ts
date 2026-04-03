import { describe, expect, it } from 'vitest'

import {
  portfolioContact,
  portfolioCtas,
  portfolioDomainModules,
  portfolioMetrics,
  portfolioProcessSteps,
  portfolioScreenshotCards,
} from '@/components/marketing/portfolio-home-content'

describe('portfolio home content contract', () => {
  it('defines the public CTAs and the login action', () => {
    expect(portfolioCtas.primary.map((item) => item.label)).toEqual([
      'GitHub',
      'LinkedIn',
      'Demo',
    ])
    expect(portfolioCtas.login).toEqual({
      href: '/login',
      label: 'Login',
    })
  })

  it('defines the auth layer and 8 domain modules', () => {
    expect(portfolioDomainModules.auth).toMatchObject({
      title: 'Auth & Segurança',
    })
    expect(portfolioDomainModules.modules).toHaveLength(8)
    expect(portfolioDomainModules.modules.map((m) => m.name)).toEqual([
      'Transações',
      'Cartões',
      'Metas',
      'Dashboard',
      'Contas',
      'Transferências',
      'Recorrência',
      'Importação',
    ])
  })

  it('defines the 6-step engineering process', () => {
    expect(portfolioProcessSteps).toHaveLength(6)
    expect(portfolioProcessSteps[0].title).toContain('PRD')
    expect(portfolioProcessSteps[2].title).toContain('Teste primeiro')
    expect(portfolioProcessSteps[2].tag).toBe('Lei do projeto')
    expect(portfolioProcessSteps[5].title).toContain('4 gates')
  })

  it('defines 5 project metrics', () => {
    expect(portfolioMetrics).toHaveLength(5)
    expect(portfolioMetrics[0]).toMatchObject({ value: '540+', label: 'testes automatizados' })
  })

  it('defines 3 screenshot cards', () => {
    expect(portfolioScreenshotCards).toHaveLength(3)
    expect(portfolioScreenshotCards.every((s) => s.src && s.alt && s.title)).toBe(true)
  })

  it('defines contact information', () => {
    expect(portfolioContact.name).toBe('Daniel Fontes')
    expect(portfolioContact.links).toBeDefined()
  })
})
