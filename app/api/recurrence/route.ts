import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import {
  createRecurringRuleForUser,
  listRecurringRulesByUser,
} from '@/modules/recurrence/service'
import { recurrenceCreateSchema } from '@/modules/recurrence'

export async function GET() {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rules = await listRecurringRulesByUser(user.id)

  return NextResponse.json(rules)
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = recurrenceCreateSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }
  const rule = await createRecurringRuleForUser(user.id, {
    ...parsed.data,
    accountId: parsed.data.accountId ?? null,
    creditCardId: parsed.data.creditCardId ?? null,
    endDate: parsed.data.endDate ?? null,
    active: parsed.data.active ?? true,
  })

  return NextResponse.json(rule, { status: 201 })
}
