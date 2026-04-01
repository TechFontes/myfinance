import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { listAdminUsers } from '@/modules/admin/service'

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

export async function GET() {
  const result = await requireAdmin()

  if ('error' in result) {
    return result.error
  }

  const users = await listAdminUsers()
  return NextResponse.json(users)
}
