// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
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
  it('exposes the dashboard routes when the sidebar is hidden', () => {
    render(<Header />)

    const navigation = screen.getByRole('navigation', { name: 'Navegação principal' })

    expect(navigation).toBeInTheDocument()
    expect(screen.getByText('controle patrimonial')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Visão geral' })).toHaveAttribute(
      'href',
      '/dashboard',
    )
    expect(screen.getByRole('link', { name: 'Transações' })).toHaveAttribute(
      'href',
      '/dashboard/transactions',
    )
    expect(screen.getByRole('link', { name: 'Cartões' })).toHaveAttribute(
      'href',
      '/dashboard/cards',
    )
  })
})
