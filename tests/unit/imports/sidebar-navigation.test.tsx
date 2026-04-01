// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Sidebar } from '@/components/layout/SideBar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/imports',
}))

describe('imports sidebar navigation', () => {
  it('includes the imports entry', () => {
    render(<Sidebar />)

    expect(screen.getByRole('link', { name: 'Importações' })).toHaveAttribute(
      'href',
      '/dashboard/imports',
    )
  })
})
