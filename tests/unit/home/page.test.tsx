// @vitest-environment jsdom
/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}))

describe('portfolio home page', () => {
  it('renders the project as a technical product case with explicit authorship', async () => {
    const { default: HomePage } = await import('@/page')

    render(<HomePage />)

    expect(
      screen.getByRole('heading', {
        name: /MyFinance é um sistema de finanças pessoais construído como produto real/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Daniel Fontes')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'GitHub' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'LinkedIn' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Demo ao vivo' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'WhatsApp' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('heading', { name: 'Problema resolvido' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Arquitetura e produto' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Qualidade de execução' })).toBeInTheDocument()
    expect(screen.getAllByText('Provas visuais').length).toBeGreaterThan(0)
    expect(
      screen.getByRole('heading', {
        name: 'O produto existe, funciona e sustenta a narrativa técnica com telas reais.',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Dashboard MyFinance' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Fluxo de transações MyFinance' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Revisão de importação CSV MyFinance' })).toBeInTheDocument()
  }, 10000)
})
