import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import {
  createAccountForUser,
  listAccountsByUser,
} from '@/modules/accounts/service'
import { accountCreateSchema } from '@/modules/accounts'

export async function GET() {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const accounts = await listAccountsByUser(user.id)

  return NextResponse.json(accounts)
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = accountCreateSchema.parse(await request.json())
  const account = await createAccountForUser(user.id, payload)

  return NextResponse.json(account, { status: 201 })
}
