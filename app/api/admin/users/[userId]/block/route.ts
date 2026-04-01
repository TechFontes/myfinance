import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import {
  blockUserForAdmin,
  unblockUserForAdmin,
} from '@/modules/admin/service'
import { adminBlockUserSchema } from '@/modules/admin'

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
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

  const parsedBody = adminBlockUserSchema.safeParse(body)

  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { userId } = await params
  const user = await blockUserForAdmin(userId, parsedBody.data.reason)

  if (!user) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(user)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const result = await requireAdmin()

  if ('error' in result) {
    return result.error
  }

  const { userId } = await params
  const user = await unblockUserForAdmin(userId)

  if (!user) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(user)
}
