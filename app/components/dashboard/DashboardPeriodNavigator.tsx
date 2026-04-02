import Link from 'next/link'
import type { DashboardPeriod } from '@/modules/dashboard'
import {
  createDashboardPeriod,
  normalizeDashboardPeriods,
  resolveDashboardPeriodSelection,
} from '@/modules/dashboard'

type DashboardPeriodNavigatorProps = {
  selectedPeriod?: DashboardPeriod
  currentPeriod?: DashboardPeriod
  availableMonths: string[]
  pathname?: string
  searchParams?: Record<string, string | string[] | undefined>
}

function buildHref({
  month,
  pathname,
  searchParams,
}: {
  month: string
  pathname: string
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (key === 'month' || value == null) {
      continue
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        params.append(key, entry)
      }
      continue
    }

    params.set(key, value)
  }

  params.set('month', month)

  return `${pathname}?${params.toString()}`
}

export function DashboardPeriodNavigator({
  selectedPeriod,
  currentPeriod,
  availableMonths,
  pathname = '/dashboard',
  searchParams,
}: DashboardPeriodNavigatorProps) {
  const normalizedPeriods = normalizeDashboardPeriods(availableMonths)
  const activePeriod = (() => {
    const period = selectedPeriod ?? currentPeriod

    if (!period) {
      return resolveDashboardPeriodSelection({ availableMonths })
    }

    if (typeof period.year === 'number' && typeof period.monthNumber === 'number') {
      return period
    }

    return createDashboardPeriod(period.month)
  })()
  const currentIndex = normalizedPeriods.findIndex((period) => period.month === activePeriod.month)
  const previousPeriod = currentIndex > 0 ? normalizedPeriods[currentIndex - 1] : null
  const nextPeriod =
    currentIndex >= 0 && currentIndex < normalizedPeriods.length - 1
      ? normalizedPeriods[currentIndex + 1]
      : null
  const years = [...new Set(normalizedPeriods.map((period) => period.year))]
  const monthsForYear = normalizedPeriods.filter((period) => period.year === activePeriod.year)
  const currentAvailablePeriod = resolveDashboardPeriodSelection({
    availableMonths,
  })

  return (
    <div className="space-y-4 rounded-[1.5rem] border border-border/70 bg-background/80 p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">
        Navegue apenas pelos meses com movimentação registrada.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {previousPeriod ? (
          <Link
            href={buildHref({
              month: previousPeriod.month,
              pathname,
              searchParams,
            })}
            aria-label="Período anterior"
            className="inline-flex h-10 items-center justify-center rounded-full border border-border/70 px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
          >
            Anterior
          </Link>
        ) : null}
        {currentAvailablePeriod.month !== activePeriod.month ? (
          <Link
            href={buildHref({
              month: currentAvailablePeriod.month,
              pathname,
              searchParams,
            })}
            className="inline-flex h-10 items-center justify-center rounded-full border border-border/70 px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            Ir para período atual
          </Link>
        ) : null}
        {nextPeriod ? (
          <Link
            href={buildHref({
              month: nextPeriod.month,
              pathname,
              searchParams,
            })}
            aria-label="Próximo período"
            className="inline-flex h-10 items-center justify-center rounded-full border border-border/70 px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
          >
            Próximo
          </Link>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {years.map((year) => {
            const periodForYear = normalizedPeriods.find((period) => period.year === year) ?? activePeriod
            const isActive = year === activePeriod.year

            return (
              <Link
                key={year}
                href={buildHref({
                  month: periodForYear.month,
                  pathname,
                  searchParams,
                })}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-foreground text-background'
                    : 'border border-border/70 text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                ].join(' ')}
              >
                {year}
              </Link>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {monthsForYear.map((period) => {
            const isActive = period.month === activePeriod.month

            return (
              <Link
                key={period.month}
                href={buildHref({
                  month: period.month,
                  pathname,
                  searchParams,
                })}
                aria-current={isActive ? 'page' : undefined}
                data-testid="dashboard-month-tab"
                className={[
                  'inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium lowercase transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border/70 text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                ].join(' ')}
              >
                {period.shortMonthLabel}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
