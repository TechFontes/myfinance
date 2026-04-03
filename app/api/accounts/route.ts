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

  const parsed = accountCreateSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }
  const account = await createAccountForUser(user.id, parsed.data)

  return NextResponse.json(account, { status: 201 })
}
