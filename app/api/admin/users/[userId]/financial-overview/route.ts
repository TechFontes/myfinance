import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { getAdminFinancialOverview } from '@/modules/admin/service'

async function requireAdmin() {
  const user = await getUserFromRequest()

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  if (user.role !== 'ADMIN') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { user }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { userId: string } },
) {
  const result = await requireAdmin()

  if ('error' in result) {
    return result.error
  }

  const overview = await getAdminFinancialOverview(params.userId)

  if (!overview) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(overview)
}
