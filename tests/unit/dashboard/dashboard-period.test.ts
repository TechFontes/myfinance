import { describe, expect, it } from 'vitest'

describe('dashboard period domain', () => {
  it('parses a valid YYYY-MM key into an explicit monthly period', async () => {
    const { parseDashboardPeriod } = await import('@/modules/dashboard/period')

    expect(parseDashboardPeriod('2026-03')).toMatchObject({
      mode: 'MONTHLY',
      month: '2026-03',
      year: 2026,
      monthNumber: 3,
      label: 'março de 2026',
      shortMonthLabel: 'mar',
    })
  })

  it('rejects invalid period keys', async () => {
    const { parseDashboardPeriod } = await import('@/modules/dashboard/period')

    expect(() => parseDashboardPeriod('2026-13')).toThrowError('Invalid dashboard period')
    expect(() => parseDashboardPeriod('03-2026')).toThrowError('Invalid dashboard period')
    expect(() => parseDashboardPeriod('2026-3')).toThrowError('Invalid dashboard period')
  })

  it('computes previous and next monthly periods', async () => {
    const { nextDashboardPeriod, parseDashboardPeriod, previousDashboardPeriod } = await import(
      '@/modules/dashboard/period'
    )

    expect(previousDashboardPeriod(parseDashboardPeriod('2026-01')).month).toBe('2025-12')
    expect(nextDashboardPeriod(parseDashboardPeriod('2026-12')).month).toBe('2027-01')
  })

  it('normalizes available periods in chronological order', async () => {
    const { normalizeDashboardPeriods } = await import('@/modules/dashboard/period')

    expect(
      normalizeDashboardPeriods(['2026-03', '2025-12', '2026-01', '2026-03']).map(
        (period) => period.month,
      ),
    ).toEqual(['2025-12', '2026-01', '2026-03'])
  })

  it('resolves the selected period to the current month when data exists', async () => {
    const { resolveDashboardPeriodSelection } = await import('@/modules/dashboard/period')

    expect(
      resolveDashboardPeriodSelection({
        availableMonths: ['2026-03', '2026-04'],
        currentDate: new Date('2026-04-16T12:00:00.000Z'),
      }),
    ).toMatchObject({
      month: '2026-04',
      year: 2026,
      monthNumber: 4,
    })
  })

  it('falls back to the last available month when the current one has no data', async () => {
    const { resolveDashboardPeriodSelection } = await import('@/modules/dashboard/period')

    expect(
      resolveDashboardPeriodSelection({
        availableMonths: ['2026-01', '2026-03'],
        currentDate: new Date('2026-04-16T12:00:00.000Z'),
      }),
    ).toMatchObject({
      month: '2026-03',
      year: 2026,
      monthNumber: 3,
    })
  })

  it('falls back to the latest available period when the requested month has no data', async () => {
    const { resolveDashboardPeriodSelection } = await import('@/modules/dashboard/period')

    expect(
      resolveDashboardPeriodSelection({
        requestedMonth: '2026-02',
        availableMonths: ['2026-01', '2026-03'],
        currentDate: new Date('2026-04-16T12:00:00.000Z'),
      }),
    ).toMatchObject({
      month: '2026-03',
      year: 2026,
      monthNumber: 3,
    })
  })
})
