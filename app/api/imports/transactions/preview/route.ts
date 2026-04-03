import { createHmac } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUserFromRequest } from '@/lib/auth'
import { listCategoriesByUser } from '@/modules/categories/service'
import { listTransactionsByUser } from '@/modules/transactions/service'
import {
  buildTransactionImportPreview,
  type CsvImportTransactionPreview,
} from '@/modules/imports'

const previewRequestSchema = z.object({
  text: z.string().trim().min(1),
  sourceName: z.string().trim().min(1).optional(),
})

type PreviewTokenPayload = {
  userId: string
  sourceName: string
  preview: CsvImportTransactionPreview
}

function normalizeComparableText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function formatDateValue(value: Date) {
  return value.toISOString().slice(0, 10)
}

function buildExistingTransactionSignatures(
  transactions: Array<{
    type: 'INCOME' | 'EXPENSE'
    description: string
    value: unknown
    competenceDate: Date
    dueDate: Date
  }>,
) {
  return transactions.map((transaction) =>
    [
      transaction.type,
      normalizeComparableText(transaction.description),
      String(transaction.value),
      formatDateValue(transaction.competenceDate),
      formatDateValue(transaction.dueDate),
    ].join('|'),
  )
}

function getPreviewSecret() {
  const secret = process.env.CSV_IMPORT_PREVIEW_SECRET ?? process.env.AUTH_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CSV_IMPORT_PREVIEW_SECRET or AUTH_SECRET environment variable is required in production')
    }
    return 'dev-import-preview-secret-not-for-production'
  }
  return secret
}

function signPreviewPayload(payload: PreviewTokenPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const signature = createHmac('sha256', getPreviewSecret())
    .update(encodedPayload)
    .digest('base64url')

  return `${encodedPayload}.${signature}`
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const parsedBody = previewRequestSchema.safeParse(body)

  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const sourceName = parsedBody.data.sourceName ?? 'import.csv'
  const [categories, transactions] = await Promise.all([
    listCategoriesByUser(user.id),
    listTransactionsByUser(user.id),
  ])

  const preview = buildTransactionImportPreview(
    parsedBody.data.text,
    categories,
    buildExistingTransactionSignatures(transactions),
  )

  return NextResponse.json({
    sourceName,
    preview,
    previewToken: signPreviewPayload({
      userId: user.id,
      sourceName,
      preview,
    }),
  })
}
