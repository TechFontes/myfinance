// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Sidebar } from '@/components/layout/SideBar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/transfers',
}))

describe('sidebar navigation', () => {
  it('exposes the transfers navigation entry', () => {
    render(<Sidebar />)

    expect(screen.getByRole('link', { name: 'Transfers' })).toHaveAttribute(
      'href',
      '/dashboard/transfers',
    )
  })
})
