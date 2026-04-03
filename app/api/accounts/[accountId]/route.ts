import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { updateAccountForUser } from '@/modules/accounts/service'
import { accountUpdateSchema } from '@/modules/accounts'

function parseAccountId(raw: string): number | null {
  const id = Number(raw)
  return Number.isInteger(id) && id > 0 ? id : null
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> },
) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { accountId: accountIdParam } = await params
  const accountId = parseAccountId(accountIdParam)

  if (!accountId) {
    return NextResponse.json({ error: 'Invalid account id' }, { status: 400 })
  }
  const parsed = accountUpdateSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }
  const account = await updateAccountForUser(user.id, accountId, parsed.data)

  if (!account) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(account)
}
