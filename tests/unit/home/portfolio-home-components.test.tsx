// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    <img alt={alt} {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />
  ),
}))

describe('PortfolioHero', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the compact hero bar with name, stack subtitle and CTA links', async () => {
    const { PortfolioHero } = await import('@/components/marketing/PortfolioHero')
    render(<PortfolioHero />)

    expect(screen.getByText('MyFinance')).toBeInTheDocument()
    expect(screen.getByText(/por Daniel Fontes/)).toBeInTheDocument()
    expect(screen.getByText(/Next\.js 16/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Login →' })).toHaveAttribute('href', '/login')
  }, 10000)
})

describe('PortfolioMetrics', () => {
  afterEach(() => { cleanup() })

  it('renders all 5 project metrics', async () => {
    const { PortfolioMetrics } = await import('@/components/marketing/PortfolioMetrics')
    render(<PortfolioMetrics />)
    expect(screen.getByText('350+')).toBeInTheDocument()
    expect(screen.getByText('testes automatizados')).toBeInTheDocument()
    expect(screen.getByText('13')).toBeInTheDocument()
    expect(screen.getByText('módulos de domínio')).toBeInTheDocument()
    expect(screen.getByText('TDD')).toBeInTheDocument()
    expect(screen.getByText('PM2')).toBeInTheDocument()
  }, 10000)
})

describe('PortfolioDomainMap', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the auth cross-cutting banner and all 8 domain modules', async () => {
    const { PortfolioDomainMap } = await import('@/components/marketing/PortfolioDomainMap')
    render(<PortfolioDomainMap />)

    expect(screen.getByText('Auth & Segurança')).toBeInTheDocument()
    expect(screen.getByText(/JWT httpOnly/)).toBeInTheDocument()
    expect(screen.getByText('Transações')).toBeInTheDocument()
    expect(screen.getByText('Cartões')).toBeInTheDocument()
    expect(screen.getByText('Metas')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Contas')).toBeInTheDocument()
    expect(screen.getByText('Transferências')).toBeInTheDocument()
    expect(screen.getByText('Recorrência')).toBeInTheDocument()
    expect(screen.getByText('Importação')).toBeInTheDocument()
  }, 10000)
})

describe('PortfolioProcessMap', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders all 6 process steps with PRD first and TDD emphasized', async () => {
    const { PortfolioProcessMap } = await import('@/components/marketing/PortfolioProcessMap')
    render(<PortfolioProcessMap />)

    expect(screen.getByText('Processo de engenharia')).toBeInTheDocument()
    expect(screen.getByText(/PRD antes de qualquer código/)).toBeInTheDocument()
    expect(screen.getByText('Escopo definido')).toBeInTheDocument()
    expect(screen.getByText('Critérios de aceitação')).toBeInTheDocument()
    expect(screen.getByText(/Teste primeiro, código depois/)).toBeInTheDocument()
    expect(screen.getByText('Lei do projeto')).toBeInTheDocument()
    expect(screen.getByText('RED — teste falha')).toBeInTheDocument()
    expect(screen.getByText('GREEN — código passa')).toBeInTheDocument()
    expect(screen.getByText(/4 gates antes de publicar/)).toBeInTheDocument()
  }, 10000)
})

describe('PortfolioScreenshotCarousel', () => {
  afterEach(() => { cleanup() })

  it('renders the first screenshot with navigation dots', async () => {
    const { PortfolioScreenshotCarousel } = await import('@/components/marketing/PortfolioScreenshotCarousel')
    render(<PortfolioScreenshotCarousel />)
    expect(screen.getByText('Produto em execução')).toBeInTheDocument()
    expect(screen.getByAltText('Dashboard MyFinance')).toBeInTheDocument()
    expect(screen.getByText('Dashboard patrimonial')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /slide/i })).toHaveLength(3)
  }, 10000)
})

describe('PortfolioFooter', () => {
  afterEach(() => { cleanup() })

  it('renders the contact card with name, email, whatsapp and social links', async () => {
    const { PortfolioFooter } = await import('@/components/marketing/PortfolioFooter')
    render(<PortfolioFooter />)
    expect(screen.getByText('Daniel Fontes')).toBeInTheDocument()
    expect(screen.getByText(/Engenheiro de software/)).toBeInTheDocument()
    expect(screen.getByText('(21) 98979-9816')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument()
  }, 10000)
})
