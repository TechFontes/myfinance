import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { updateAccountForUser } from '@/modules/accounts/service'
import { accountUpdateSchema } from '@/modules/accounts'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { accountId: string } },
) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const accountId = Number(params.accountId)
  const payload = accountUpdateSchema.parse(await request.json())
  const account = await updateAccountForUser(user.id, accountId, payload)

  if (!account) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(account)
}
