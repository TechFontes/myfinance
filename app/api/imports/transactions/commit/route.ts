import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUserFromRequest } from '@/lib/auth'
import { listCategoriesByUser } from '@/modules/categories/service'
import { createTransactionForUser } from '@/modules/transactions/service'
import {
  csvImportCommitSchema,
  type CsvImportTransactionPreview,
} from '@/modules/imports'

type PreviewTokenPayload = {
  userId: string
  sourceName: string
  preview: CsvImportTransactionPreview
}

const previewTokenPayloadSchema = z.object({
  userId: z.string().trim().min(1),
  sourceName: z.string().trim().min(1),
  preview: z.object({
    rows: z.array(
      z.object({
        line: z.number().int().positive(),
        readyToPersist: z.boolean(),
        mappedCategoryId: z.number().int().positive().nullable(),
        issues: z.array(
          z.object({
            code: z.enum(['missing_category', 'duplicate_row', 'invalid_row']),
            field: z.string().trim().min(1).optional(),
            message: z.string().trim().min(1),
          }),
        ),
        transaction: z.object({
          type: z.enum(['INCOME', 'EXPENSE']),
          description: z.string().trim().min(1),
          value: z.string().trim().min(1),
          categoryName: z.string().trim().min(1),
          competenceDate: z.string().trim().min(1),
          dueDate: z.string().trim().min(1),
          status: z.enum(['PLANNED', 'PENDING', 'PAID', 'CANCELED']),
          fixed: z.boolean(),
          paidAt: z.string().trim().min(1).nullable().optional(),
          accountName: z.string().trim().min(1).nullable().optional(),
          creditCardName: z.string().trim().min(1).nullable().optional(),
          installment: z.number().int().positive().nullable().optional(),
          installments: z.number().int().positive().nullable().optional(),
        }),
      }),
    ),
    summary: z.object({
      totalRows: z.number().int().nonnegative(),
      readyRows: z.number().int().nonnegative(),
      invalidRows: z.number().int().nonnegative(),
      missingCategoryRows: z.number().int().nonnegative(),
      duplicateRows: z.number().int().nonnegative(),
    }),
    possibleDuplicates: z.array(
      z.object({
        lineNumber: z.number().int().positive(),
        reason: z.string().trim().min(1),
        matchedTransactionId: z.number().int().positive().optional(),
        matchedAt: z.string().trim().min(1).optional(),
      }),
    ),
    pendingCategoryMappings: z.array(
      z.object({
        sourceName: z.string().trim().min(1),
        needsMapping: z.boolean(),
        suggestedCategoryIds: z.array(z.number().int().positive()).optional(),
        mappedCategoryId: z.number().int().positive().nullable().optional(),
      }),
    ),
    readyToCommit: z.boolean(),
  }),
})

function normalizeComparableText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function parseDateAtUTC(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

function getPreviewSecret() {
  return (
    process.env.CSV_IMPORT_PREVIEW_SECRET ??
    process.env.AUTH_SECRET ??
    'myfinance-import-preview-secret'
  )
}

function verifyPreviewToken(token: string): PreviewTokenPayload | null {
  const [encodedPayload, signature] = token.split('.')

  if (!encodedPayload || !signature) {
    return null
  }

  const expectedSignature = createHmac('sha256', getPreviewSecret())
    .update(encodedPayload)
    .digest('base64url')

  const provided = Buffer.from(signature)
  const expected = Buffer.from(expectedSignature)

  if (provided.length !== expected.length) {
    return null
  }

  if (!timingSafeEqual(provided, expected)) {
    return null
  }

  try {
    return previewTokenPayloadSchema.parse(
      JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')),
    ) as PreviewTokenPayload
  } catch {
    return null
  }
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

  const parsedBody = csvImportCommitSchema.safeParse(body)

  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const previewPayload = verifyPreviewToken(parsedBody.data.previewToken)

  if (!previewPayload || previewPayload.userId !== user.id) {
    return NextResponse.json({ error: 'Invalid preview token' }, { status: 400 })
  }

  const categories = await listCategoriesByUser(user.id)
  const knownCategoryIds = new Set(categories.map((category) => category.id))
  const acceptedDuplicateLines = new Set(parsedBody.data.acceptedDuplicateLineNumbers)
  const mappedCategories = new Map(
    parsedBody.data.categoryMappings
      .filter((mapping) => mapping.mappedCategoryId !== undefined && mapping.mappedCategoryId !== null)
      .map((mapping) => [
        normalizeComparableText(mapping.sourceName),
        mapping.mappedCategoryId as number,
      ] as const),
  )

  const createdTransactions: Array<Awaited<ReturnType<typeof createTransactionForUser>>> = []
  const skippedRows: Array<{ line: number; reasons: string[] }> = []

  for (const row of previewPayload.preview.rows) {
    const reasons: string[] = []
    const duplicateIssue = row.issues.some((issue) => issue.code === 'duplicate_row')
    const hasResolvableCategoryIssue = row.issues.some((issue) => issue.code === 'missing_category')

    let categoryId = row.mappedCategoryId

    if (categoryId === null && row.transaction.categoryName) {
      categoryId = mappedCategories.get(normalizeComparableText(row.transaction.categoryName)) ?? null
    }

    if (duplicateIssue && !acceptedDuplicateLines.has(row.line)) {
      reasons.push('duplicate row was not reviewed')
    }

    if (categoryId === null && hasResolvableCategoryIssue) {
      reasons.push('category mapping is required')
    }

    if (categoryId !== null && !knownCategoryIds.has(categoryId)) {
      reasons.push('mapped category does not belong to this user')
    }

    const unresolvableIssues = row.issues.filter((issue) => issue.code === 'invalid_row')

    if (unresolvableIssues.length > 0) {
      reasons.push(...unresolvableIssues.map((issue) => issue.message))
    }

    if (reasons.length > 0 || categoryId === null) {
      skippedRows.push({ line: row.line, reasons: reasons.length > 0 ? reasons : ['row is not ready to commit'] })
      continue
    }

    const createdTransaction = await createTransactionForUser(user.id, {
      type: row.transaction.type,
      description: row.transaction.description,
      value: row.transaction.value,
      categoryId,
      accountId: null,
      creditCardId: null,
      invoiceId: null,
      competenceDate: parseDateAtUTC(row.transaction.competenceDate),
      dueDate: parseDateAtUTC(row.transaction.dueDate),
      paidAt: row.transaction.paidAt ? parseDateAtUTC(row.transaction.paidAt) : null,
      status: row.transaction.status,
      fixed: row.transaction.fixed,
      installment: row.transaction.installment ?? null,
      installments: row.transaction.installments ?? null,
    })

    createdTransactions.push(createdTransaction)
  }

  if (createdTransactions.length === 0) {
    return NextResponse.json(
      {
        error: 'No rows were ready to commit',
        skippedRows,
      },
      { status: 400 },
    )
  }

  return NextResponse.json(
    {
      committedRows: createdTransactions.length,
      skippedRows,
      transactions: createdTransactions,
    },
    { status: 201 },
  )
}
