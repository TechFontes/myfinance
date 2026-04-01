import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { updateAdminUser } from '@/modules/admin/service'
import { adminUserUpdateSchema } from '@/modules/admin'

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } },
) {
  const result = await requireAdmin()

  if ('error' in result) {
    return result.error
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const parsedBody = adminUserUpdateSchema.safeParse(body)

  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const user = await updateAdminUser(params.userId, parsedBody.data)

  if (!user) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(user)
}
