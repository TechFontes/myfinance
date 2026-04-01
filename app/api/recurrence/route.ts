import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
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

  try {
    const payload = recurrenceCreateSchema.parse(await request.json())
    const rule = await createRecurringRuleForUser(user.id, {
      ...payload,
      accountId: payload.accountId ?? null,
      creditCardId: payload.creditCardId ?? null,
      endDate: payload.endDate ?? null,
      active: payload.active ?? true,
    })

    return NextResponse.json(rule, { status: 201 })
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
