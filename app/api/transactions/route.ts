// app/api/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { createTransaction, listTransactionsByUser } from '@/services/transactionServer'


export async function GET(_req: NextRequest) {
  const user = await getUserFromRequest()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const transactions = await listTransactionsByUser(user.id)
  return NextResponse.json(transactions)
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  // TODO: validar com zod
  const transaction = await createTransaction({
    ...body,
    user: { connect: { id: user.id } },
  })

  return NextResponse.json({ transaction }, { status: 201 })
}
