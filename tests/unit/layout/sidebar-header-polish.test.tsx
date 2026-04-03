// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/SideBar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/cards',
  useRouter: () => ({
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, logout: vi.fn() }),
}))

vi.mock('@/components/ui/ThemeToggle', () => ({
  ThemeToggle: () => <button type="button">Tema</button>,
}))

afterEach(cleanup)

describe('sidebar polish', () => {
  it('renders with gradient background', () => {
    render(<Sidebar />)
    const aside = screen.getByRole('complementary')
    expect(aside.className).toContain('bg-gradient-to-b')
    expect(aside.className).toContain('from-card')
    expect(aside.className).toContain('to-card/95')
  })

  it('renders the primary accent line at the top', () => {
    render(<Sidebar />)
    const aside = screen.getByRole('complementary')
    const accentLine = aside.querySelector('.bg-gradient-to-r')
    expect(accentLine).toBeInTheDocument()
    expect(accentLine?.className).toContain('from-primary/60')
  })

  it('applies prominent brand styling with larger text and wider tracking', () => {
    render(<Sidebar />)
    const heading = screen.getByText('MyFinance')
    expect(heading.className).toContain('text-xl')
    expect(heading.className).toContain('tracking-wide')
  })

  it('active nav link has primary left border accent', () => {
    render(<Sidebar />)
    const activeLink = screen.getByRole('link', { name: 'Cartões' })
    expect(activeLink).toHaveAttribute('aria-current', 'page')
    expect(activeLink.className).toContain('border-l-3')
    expect(activeLink.className).toContain('border-primary')
  })

  it('nav items have transition-all duration-200 classes', () => {
    render(<Sidebar />)
    const link = screen.getByRole('link', { name: 'Visão geral' })
    expect(link.className).toContain('transition-all')
    expect(link.className).toContain('duration-200')
  })
})

describe('header polish', () => {
  it('has a bottom border for clear separation', () => {
    render(<Header />)
    const header = screen.getByRole('banner')
    expect(header.className).toContain('border-b')
    expect(header.className).toContain('border-border/70')
  })

  it('has backdrop-blur for premium feel', () => {
    render(<Header />)
    const header = screen.getByRole('banner')
    expect(header.className).toContain('backdrop-blur')
  })

  it('app title is bold', () => {
    render(<Header />)
    const title = screen.getByText('MyFinance')
    expect(title.className).toContain('font-semibold')
  })

  it('mobile nav items have transition-all duration-200', () => {
    render(<Header />)
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' })
    const link = within(nav).getByRole('link', { name: 'Visão geral' })
    expect(link.className).toContain('transition-all')
    expect(link.className).toContain('duration-200')
  })
})
