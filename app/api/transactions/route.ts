import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import {
  countTransactionsByUser,
  createTransactionForUser,
  listTransactionsByUser,
} from '@/modules/transactions/service'
import { transactionCreateSchema, transactionFiltersSchema } from '@/modules/transactions'

function parseTransactionFilters(request: NextRequest) {
  const rawFilters = Object.fromEntries(new URL(request.url).searchParams.entries())
  const result = transactionFiltersSchema.safeParse(rawFilters)

  if (!result.success) {
    return null
  }

  return {
    ...result.data,
    page: result.data.page ?? 1,
    pageSize: result.data.pageSize ?? 20,
  }
}

function normalizeTransactionCreatePayload(
  payload: ReturnType<typeof transactionCreateSchema.parse>,
) {
  return {
    ...payload,
    accountId: payload.accountId ?? null,
    creditCardId: payload.creditCardId ?? null,
    invoiceId: payload.invoiceId ?? null,
    paidAt: payload.paidAt ?? null,
    fixed: payload.fixed ?? false,
    installment: payload.installment ?? null,
    installments: payload.installments ?? null,
  }
}

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const filters = parseTransactionFilters(request)

  if (!filters) {
    return NextResponse.json({ error: 'Invalid filters' }, { status: 400 })
  }

  const [items, total] = await Promise.all([
    listTransactionsByUser(user.id, filters),
    countTransactionsByUser(user.id, filters),
  ])

  return NextResponse.json({
    items,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
  })
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = transactionCreateSchema.parse(await request.json())
  const transaction = await createTransactionForUser(
    user.id,
    normalizeTransactionCreatePayload(payload),
  )

  return NextResponse.json(transaction, { status: 201 })
}
