// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DashboardPeriodNavigator } from '@/components/dashboard/DashboardPeriodNavigator'
import { createDashboardPeriod } from '@/modules/dashboard/period'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('dashboard period navigator', () => {
  it('renders year tabs in chronological order using only years with data', () => {
    render(
      <DashboardPeriodNavigator
        availableMonths={['2024-12', '2026-01', '2025-03', '2026-03']}
        selectedPeriod={createDashboardPeriod('2026-03')}
      />,
    )

    expect(screen.getByRole('link', { name: '2024' })).toHaveAttribute('href', '/dashboard?month=2024-12')
    expect(screen.getByRole('link', { name: '2025' })).toHaveAttribute('href', '/dashboard?month=2025-03')
    expect(screen.getByRole('link', { name: '2026' })).toHaveAttribute('aria-current', 'page')
  })

  it('renders month tabs only for the selected year and keeps them ordered', () => {
    render(
      <DashboardPeriodNavigator
        availableMonths={['2025-12', '2026-03', '2026-01', '2026-02']}
        selectedPeriod={createDashboardPeriod('2026-02')}
      />,
    )

    expect(screen.queryByRole('link', { name: 'dez' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'jan' })).toHaveAttribute('href', '/dashboard?month=2026-01')
    expect(screen.getByRole('link', { name: 'fev' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'mar' })).toHaveAttribute('href', '/dashboard?month=2026-03')
  })

  it('renders a quick action back to the current period when available and not selected', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-16T12:00:00.000Z'))

    render(
      <DashboardPeriodNavigator
        availableMonths={['2026-02', '2026-03']}
        selectedPeriod={createDashboardPeriod('2026-02')}
      />,
    )

    expect(screen.getByRole('link', { name: 'Ir para período atual' })).toHaveAttribute(
      'href',
      '/dashboard?month=2026-03',
    )
  })
})
