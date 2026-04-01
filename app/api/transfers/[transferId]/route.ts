import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { getUserFromRequest } from '@/lib/auth'
import { updateTransferForUser } from '@/modules/transfers/service'
import { transferUpdateSchema } from '@/modules/transfers'

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ transferId: string }> },
) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { transferId: transferIdParam } = await params
    const transferId = Number(transferIdParam)
    const payload = transferUpdateSchema.parse(await request.json())
    const transfer = await updateTransferForUser(user.id, transferId, payload)

    if (!transfer) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(transfer)
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
