import {
  getAvailableMonths,
  getDashboardReport,
} from '@/services/dashboardService'
import { getUserFromRequest } from '@/lib/auth'
import { DashboardReportView } from '@/components/dashboard/DashboardReportView'
import { resolveDashboardPeriodSelection } from '@/modules/dashboard'
import { redirect } from 'next/navigation'

type DashboardPageProps = {
  searchParams?:
    | Promise<{
        month?: string
        view?: string
      }>
    | {
        month?: string
        view?: string
      }
}

const dashboardViews = new Set(['general', 'receivable', 'payable', 'consolidated'])

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedSearchParams = searchParams ? await Promise.resolve(searchParams) : undefined
  const user = await getUserFromRequest()

  if (!user) {
    return redirect('/login?callbackUrl=%2Fdashboard')
  }

  const availableMonths = await getAvailableMonths(user.id)
  const selectedPeriod = resolveDashboardPeriodSelection({
    requestedMonth: resolvedSearchParams?.month,
    availableMonths,
  })
  const selectedView = dashboardViews.has(resolvedSearchParams?.view ?? '')
    ? (resolvedSearchParams?.view as 'general' | 'receivable' | 'payable' | 'consolidated')
    : 'general'

  const report = await getDashboardReport(user.id, selectedPeriod.month)

  return (
    <DashboardReportView
      availableMonths={availableMonths}
      report={report}
      selectedView={selectedView}
    />
  )
}
