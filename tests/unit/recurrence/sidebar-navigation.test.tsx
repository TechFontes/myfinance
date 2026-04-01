// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Sidebar } from '@/components/layout/SideBar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/recurrence',
}))

describe('sidebar navigation', () => {
  it('exposes the recurrence navigation entry', () => {
    render(<Sidebar />)

    expect(screen.getByRole('link', { name: 'Recorrência' })).toHaveAttribute(
      'href',
      '/dashboard/recurrence',
    )
  })
})
