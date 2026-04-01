import {
  getAvailableMonths,
  getDashboardReport,
} from '@/services/dashboardService'
import { getUserFromRequest } from '@/lib/auth'
import { DashboardReportView } from '@/components/dashboard/DashboardReportView'

type DashboardPageProps = {
  searchParams?: {
    month?: string
  }
}

function createEmptyReport(month: string) {
  return {
    period: {
      mode: 'MONTHLY' as const,
      month,
      label: month,
    },
    summary: {
      forecastIncome: '0.00',
      forecastExpense: '0.00',
      realizedIncome: '0.00',
      realizedExpense: '0.00',
      forecastBalance: '0.00',
      realizedBalance: '0.00',
    },
    pending: [],
    accounts: [],
    categories: [],
    cardInvoices: [],
    transfers: [],
  }
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const currentMonth = searchParams?.month ?? new Date().toISOString().slice(0, 7)
  const user = await getUserFromRequest()

  if (!user) {
    const emptyReport = createEmptyReport(currentMonth)

    return (
      <DashboardReportView
        availableMonths={[currentMonth]}
        report={emptyReport}
      />
    )
  }

  const [report, availableMonths] = await Promise.all([
    getDashboardReport(user.id, currentMonth),
    getAvailableMonths(user.id),
  ])

  return (
    <DashboardReportView
      availableMonths={availableMonths}
      report={report}
    />
  )
}
