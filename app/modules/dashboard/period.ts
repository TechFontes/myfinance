import type { DashboardPeriod } from './contracts'

const DASHBOARD_MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/
const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})
const MONTH_SHORT_LABEL_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  timeZone: 'UTC',
})

function buildUtcMonthDate(year: number, monthNumber: number) {
  return new Date(Date.UTC(year, monthNumber - 1, 1))
}

function monthKeyFromDate(date: Date) {
  const year = date.getUTCFullYear()
  const monthNumber = date.getUTCMonth() + 1

  return `${year}-${String(monthNumber).padStart(2, '0')}`
}

export function parseDashboardPeriod(monthKey: string): DashboardPeriod {
  const match = DASHBOARD_MONTH_PATTERN.exec(monthKey)

  if (!match) {
    throw new Error('Invalid dashboard period')
  }

  const year = Number(match[1])
  const monthNumber = Number(match[2])
  const date = buildUtcMonthDate(year, monthNumber)

  return {
    mode: 'MONTHLY',
    month: monthKeyFromDate(date),
    year,
    monthNumber,
    label: MONTH_LABEL_FORMATTER.format(date),
    shortMonthLabel: MONTH_SHORT_LABEL_FORMATTER
      .format(date)
      .replace('.', '')
      .toLowerCase(),
  }
}

export function createDashboardPeriod(monthKey: string) {
  return parseDashboardPeriod(monthKey)
}

export function normalizeAvailableDashboardMonths(monthKeys: string[]) {
  return [...new Set(monthKeys)].filter((monthKey) => DASHBOARD_MONTH_PATTERN.test(monthKey)).sort()
}

export function normalizeDashboardPeriods(monthKeys: string[]) {
  return normalizeAvailableDashboardMonths(monthKeys).map((monthKey) => parseDashboardPeriod(monthKey))
}

export function previousDashboardPeriod(period: DashboardPeriod) {
  const previous = buildUtcMonthDate(period.year, period.monthNumber - 1)

  return parseDashboardPeriod(monthKeyFromDate(previous))
}

export function nextDashboardPeriod(period: DashboardPeriod) {
  const next = buildUtcMonthDate(period.year, period.monthNumber + 1)

  return parseDashboardPeriod(monthKeyFromDate(next))
}

type ResolveDashboardPeriodSelectionInput = {
  requestedMonth?: string | null
  availableMonths: string[]
  currentDate?: Date
}

export function resolveDashboardPeriodSelection({
  requestedMonth,
  availableMonths,
  currentDate = new Date(),
}: ResolveDashboardPeriodSelectionInput) {
  const normalizedAvailableMonths = normalizeAvailableDashboardMonths(availableMonths)

  if (requestedMonth && normalizedAvailableMonths.includes(requestedMonth)) {
    return parseDashboardPeriod(requestedMonth)
  }

  const normalizedPeriods = normalizedAvailableMonths.map((monthKey) => parseDashboardPeriod(monthKey))
  const currentPeriodKey = monthKeyFromDate(
    buildUtcMonthDate(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1),
  )
  const currentAvailablePeriod = normalizedPeriods.find((period) => period.month === currentPeriodKey)

  if (currentAvailablePeriod) {
    return currentAvailablePeriod
  }

  return normalizedPeriods.at(-1) ?? parseDashboardPeriod(currentPeriodKey)
}

export function resolveDashboardPeriod(
  requestedMonth: string | null | undefined,
  availableMonths: string[],
  currentDate?: Date,
) {
  return resolveDashboardPeriodSelection({
    requestedMonth,
    availableMonths,
    currentDate,
  })
}
