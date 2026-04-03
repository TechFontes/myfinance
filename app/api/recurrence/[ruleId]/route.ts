import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { updateRecurringRuleForUser } from '@/modules/recurrence/service'
import { recurrenceUpdateSchema } from '@/modules/recurrence'

function parseRecurringRuleId(ruleId: string) {
  const parsedId = Number(ruleId)

  return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ruleId: string }> },
) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { ruleId: ruleIdParam } = await params
  const recurringRuleId = parseRecurringRuleId(ruleIdParam)

  if (!recurringRuleId) {
    return NextResponse.json({ error: 'Invalid recurring rule id' }, { status: 400 })
  }

  const parsed = recurrenceUpdateSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }
  const rule = await updateRecurringRuleForUser(user.id, recurringRuleId, parsed.data)

  if (!rule) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(rule)
}
