// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/SideBar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/cards',
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    logout: vi.fn(),
  }),
}))

vi.mock('@/components/ui/ThemeToggle', () => ({
  ThemeToggle: () => <button type="button">Tema</button>,
}))

afterEach(() => {
  cleanup()
})

describe('sidebar', () => {
  it('renders the sidebar as an editorial navigation rail', () => {
    render(<Sidebar />)

    expect(screen.getByText('MyFinance')).toBeInTheDocument()
    expect(screen.getByText('Workspace financeiro')).toBeInTheDocument()
    expect(screen.getByText('Controle patrimonial')).toBeInTheDocument()
  })

  it('marks the active module with aria-current page', () => {
    render(<Sidebar />)

    expect(screen.getAllByRole('link', { name: 'Cartões' })[0]).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getAllByRole('link', { name: 'Visão geral' })[0]).not.toHaveAttribute(
      'aria-current',
    )
  })
})

describe('header mobile navigation', () => {
  it('keeps the patrimonial label visible when the sidebar is hidden', () => {
    render(<Header />)

    const banner = screen.getByRole('banner')
    const patrimonialLabel = within(banner).getByText('Controle patrimonial')
    const navigation = within(banner).getByRole('navigation', { name: 'Navegação principal' })

    expect(patrimonialLabel).toBeVisible()
    expect(patrimonialLabel).not.toHaveClass('hidden')
    expect(navigation).toBeInTheDocument()
    expect(within(navigation).getByRole('link', { name: 'Visão geral' })).toHaveAttribute(
      'href',
      '/dashboard',
    )
    expect(within(navigation).getByRole('link', { name: 'Transações' })).toHaveAttribute(
      'href',
      '/dashboard/transactions',
    )
    expect(within(navigation).getByRole('link', { name: 'Cartões' })).toHaveAttribute(
      'href',
      '/dashboard/cards',
    )
  })
})
