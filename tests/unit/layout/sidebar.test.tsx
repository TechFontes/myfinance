// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Sidebar } from '@/components/layout/SideBar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/cards',
}))

afterEach(() => {
  cleanup()
})

describe('sidebar', () => {
  it('renders the premium brand block', () => {
    render(<Sidebar />)

    expect(screen.getByText('MyFinance')).toBeInTheDocument()
    expect(screen.getByText('Workspace financeiro')).toBeInTheDocument()
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
