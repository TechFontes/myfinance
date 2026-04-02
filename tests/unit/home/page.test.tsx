// @vitest-environment jsdom
/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}))

describe('portfolio home page', () => {
  it('renders all portfolio sections with key content', async () => {
    const { default: HomePage } = await import('@/page')

    render(<HomePage />)

    // PortfolioHero
    expect(screen.getByText('MyFinance')).toBeInTheDocument()
    expect(screen.getByText(/por Daniel Fontes/i)).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'GitHub' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'LinkedIn' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Login →' })).toHaveAttribute('href', '/login')

    // PortfolioDomainMap
    expect(screen.getByText('Mapa de domínio')).toBeInTheDocument()
    expect(screen.getByText('Auth & Segurança')).toBeInTheDocument()

    // PortfolioProcessMap
    expect(screen.getByText('Processo de engenharia')).toBeInTheDocument()
    expect(screen.getByText(/PRD antes de qualquer código/i)).toBeInTheDocument()

    // PortfolioMetrics
    expect(screen.getByText('350+')).toBeInTheDocument()
    expect(screen.getByText('testes automatizados')).toBeInTheDocument()

    // PortfolioScreenshotCarousel
    expect(screen.getByText('Produto em execução')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Dashboard MyFinance' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /slide/i })).toHaveLength(3)

    // PortfolioFooter
    expect(screen.getByText('Daniel Fontes')).toBeInTheDocument()
    expect(screen.getByText('(21) 98979-9816')).toBeInTheDocument()
  }, 10000)
})
