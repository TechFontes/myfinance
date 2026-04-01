import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { getUserFromRequest } from '@/lib/auth'
import {
  createTransferForUser,
  listTransfersByUser,
} from '@/modules/transfers/service'
import { transferCreateSchema } from '@/modules/transfers'

function handleTransferError(error: unknown) {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code: string }).code)

    if (code === 'TRANSFER_SAME_ACCOUNT') {
      return NextResponse.json(
        { error: 'Transfer source and destination accounts must be different' },
        { status: 400 },
      )
    }
  }

  return null
}

export async function GET() {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const transfers = await listTransfersByUser(user.id)

  return NextResponse.json(transfers)
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = transferCreateSchema.parse(await request.json())
    const transfer = await createTransferForUser(user.id, payload)

    return NextResponse.json(transfer, { status: 201 })
  } catch (error) {
    const domainError = handleTransferError(error)

    if (domainError) {
      return domainError
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? 'Invalid transfer payload' },
        { status: 400 },
      )
    }

    throw error
  }
}
