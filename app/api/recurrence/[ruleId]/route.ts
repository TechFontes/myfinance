import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
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

  try {
    const payload = recurrenceUpdateSchema.parse(await request.json())
    const rule = await updateRecurringRuleForUser(user.id, recurringRuleId, payload)

    if (!rule) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(rule)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? 'Invalid recurrence payload' },
        { status: 400 },
      )
    }

    throw error
  }
}
