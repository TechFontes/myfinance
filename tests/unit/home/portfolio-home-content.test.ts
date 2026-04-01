import { describe, expect, it } from 'vitest'

import {
  portfolioCtas,
  portfolioHighlights,
  portfolioSections,
} from '@/components/marketing/portfolio-home-content'

describe('portfolio home content contract', () => {
  it('defines the public CTAs and the login action separately', () => {
    expect(portfolioCtas.primary.map((item) => item.label)).toEqual([
      'GitHub',
      'LinkedIn',
      'Demo ao vivo',
      'WhatsApp',
    ])
    expect(portfolioCtas.login).toEqual({
      href: '/login',
      label: 'Login',
    })
  })

  it('exposes the core highlights and sections of the case narrative', () => {
    expect(portfolioHighlights).toContain('Next.js 16')
    expect(portfolioHighlights).toContain('TDD')
    expect(portfolioHighlights).toContain('Standalone deploy')
    expect(portfolioSections.map((section) => section.id)).toEqual([
      'problem',
      'architecture',
      'quality',
      'screenshots',
    ])
  })
})
