import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { getAvailableMonths, getDashboardReport } from '@/services/dashboardService'
import { resolveDashboardPeriodSelection } from '@/modules/dashboard'

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const availableMonths = await getAvailableMonths(user.id)
  const selectedPeriod = resolveDashboardPeriodSelection({
    requestedMonth: req.nextUrl.searchParams.get('month'),
    availableMonths,
  })

  const report = await getDashboardReport(user.id, selectedPeriod.month)

  return NextResponse.json(report)
}
