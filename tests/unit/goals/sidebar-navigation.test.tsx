// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Sidebar } from '@/components/layout/SideBar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/goals',
}))

describe('sidebar navigation', () => {
  it('exposes the goals navigation entry', () => {
    render(<Sidebar />)

    expect(screen.getByRole('link', { name: 'Metas' })).toHaveAttribute(
      'href',
      '/dashboard/goals',
    )
  })
})
