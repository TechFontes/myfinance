import {
  getAvailableMonths,
  getDashboardReport,
} from '@/services/dashboardService'
import { getUserFromRequest } from '@/lib/auth'
import { DashboardReportView } from '@/components/dashboard/DashboardReportView'
import { redirect } from 'next/navigation'

type DashboardPageProps = {
  searchParams?:
    | Promise<{
        month?: string
      }>
    | {
        month?: string
      }
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedSearchParams = searchParams ? await Promise.resolve(searchParams) : undefined
  const currentMonth = resolvedSearchParams?.month ?? new Date().toISOString().slice(0, 7)
  const user = await getUserFromRequest()

  if (!user) {
    return redirect('/login?callbackUrl=%2Fdashboard')
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
