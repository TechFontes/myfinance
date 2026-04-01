// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/SideBar'

const logoutMock = vi.fn()
const routerReplaceMock = vi.fn()
const routerRefreshMock = vi.fn()
const authState: { user: { name: string; email: string } | null; logout: typeof logoutMock } = {
  user: null,
  logout: logoutMock,
}

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/cards',
  useRouter: () => ({
    replace: routerReplaceMock,
    refresh: routerRefreshMock,
  }),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => authState,
}))

vi.mock('@/components/ui/ThemeToggle', () => ({
  ThemeToggle: () => <button type="button">Tema</button>,
}))

afterEach(() => {
  authState.user = null
  logoutMock.mockReset()
  routerReplaceMock.mockReset()
  routerRefreshMock.mockReset()
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

    const activeLink = screen.getAllByRole('link', { name: 'Cartões' })[0]

    expect(activeLink).toHaveAttribute('aria-current', 'page')
    expect(activeLink).toHaveClass('bg-card/80')
    expect(activeLink).not.toHaveClass('bg-foreground')
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

  it('renders a visible logout action when a user is signed in', async () => {
    authState.user = {
      name: 'Daniel Teste',
      email: 'daniel@example.com',
    }
    logoutMock.mockResolvedValue(undefined)

    const user = userEvent.setup()

    render(<Header />)

    const logoutButton = screen.getByRole('button', { name: 'Sair da conta' })

    expect(logoutButton).toBeVisible()
    await user.click(logoutButton)
    expect(logoutMock).toHaveBeenCalledTimes(1)
    expect(routerReplaceMock).toHaveBeenCalledWith('/login')
    expect(routerRefreshMock).toHaveBeenCalledTimes(1)
  })
})
