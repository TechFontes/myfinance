// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Sidebar } from '@/components/layout/SideBar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/categories',
}))

describe('sidebar navigation', () => {
  it('exposes the categories navigation entry', () => {
    render(<Sidebar />)

    expect(screen.getByRole('link', { name: 'Categorias' })).toHaveAttribute(
      'href',
      '/dashboard/categories',
    )
  })
})
