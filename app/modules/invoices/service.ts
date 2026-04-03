import { randomUUID } from 'node:crypto'

type InvoiceTransactionLike = {
  id: number
  value?: string | number | { toString(): string }
  status?: string | null
  installmentGroupId?: string | null
  installment?: number | null
  installments?: number | null
}

export type InvoicePeriod = {
  month: number
  year: number
  dueDate: Date
}

export type InstallmentTransactionGroup = {
  installmentGroupId: string | null
  transactions: InvoiceTransactionLike[]
}

type InvoiceRecordLike = {
  id: number
  month: number
  year: number
  status: 'OPEN' | 'PAID' | 'CANCELED'
  total?: { toString(): string } | string | number
  dueDate: Date
  transactions: InvoiceTransactionLike[]
  creditCardId?: number
  creditCard?: unknown
}

function buildInvoiceInclude() {
  return {
    creditCard: true,
    transactions: {
      orderBy: [
        { competenceDate: 'asc' as const },
        { installment: 'asc' as const },
        { id: 'asc' as const },
      ],
    },
  }
}

export function reconcileInvoiceRecord<TInvoice extends InvoiceRecordLike>(invoice: TInvoice) {
  return {
    ...invoice,
    total: calculateInvoiceTotal(invoice.transactions),
  }
}

export async function listInvoicesByCard(userId: string, creditCardId: number) {
  const { prisma } = await import('@/lib/prisma')

  const invoices = await prisma.invoice.findMany({
    where: {
      creditCardId,
      creditCard: {
        userId,
      },
    },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    include: buildInvoiceInclude(),
  })

  return invoices.map((invoice) => reconcileInvoiceRecord(invoice as InvoiceRecordLike))
}

export async function getInvoiceByIdForUser(userId: string, invoiceId: number) {
  const { prisma } = await import('@/lib/prisma')

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      creditCard: {
        userId,
      },
    },
    include: buildInvoiceInclude(),
  })

  if (!invoice) {
    return null
  }

  return reconcileInvoiceRecord(invoice as InvoiceRecordLike)
}

export async function payInvoiceForUser(userId: string, invoiceId: number) {
  const { prisma } = await import('@/lib/prisma')

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      creditCard: {
        userId,
      },
    },
    include: buildInvoiceInclude(),
  })

  if (!invoice) {
    return null
  }

  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: 'PAID',
    },
    include: buildInvoiceInclude(),
  })

  return reconcileInvoiceRecord(updatedInvoice as InvoiceRecordLike)
}

export function normalizeInvoicePeriod(month: number, year: number) {
  return { month, year }
}

export function buildInvoiceDueDate(year: number, month: number, dueDay: number) {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const normalizedDueDay = Math.min(Math.max(dueDay, 1), daysInMonth)

  return new Date(Date.UTC(year, month - 1, normalizedDueDay))
}

export function resolveInvoicePeriod(
  referenceDate: Date,
  closeDay: number,
  dueDay: number,
): InvoicePeriod {
  const referenceMonth = referenceDate.getUTCMonth() + 1
  const referenceYear = referenceDate.getUTCFullYear()
  const needsNextMonth = referenceDate.getUTCDate() > closeDay
  const baseMonth = referenceMonth + (needsNextMonth ? 1 : 0)
  const year = referenceYear + Math.floor((baseMonth - 1) / 12)
  const month = ((baseMonth - 1) % 12) + 1

  return {
    month,
    year,
    dueDate: buildInvoiceDueDate(year, month, dueDay),
  }
}

function toCents(value: string | number | { toString(): string } | undefined) {
  return Math.round(Number(value ?? 0) * 100)
}

function fromCents(cents: number) {
  return (cents / 100).toFixed(2)
}

export function calculateInvoiceTotal(transactions: InvoiceTransactionLike[]) {
  const totalCents = transactions.reduce((sum, transaction) => {
    if (transaction.status === 'CANCELED') {
      return sum
    }

    return sum + toCents(transaction.value)
  }, 0)

  return fromCents(totalCents)
}

export function groupInstallmentTransactions(transactions: InvoiceTransactionLike[]) {
  const groups = new Map<string | null, InvoiceTransactionLike[]>()

  for (const transaction of transactions) {
    const key = transaction.installmentGroupId ?? null
    const current = groups.get(key) ?? []
    current.push(transaction)
    groups.set(key, current)
  }

  return Array.from(groups.entries()).map(([installmentGroupId, groupedTransactions]) => ({
    installmentGroupId,
    transactions: groupedTransactions,
  }))
}

export async function payInvoiceForUserE2E(
  userId: string,
  invoiceId: number,
  input: { accountId: number; paidAt: Date }
): Promise<object | null> {
  const { prisma } = await import('@/lib/prisma')

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId },
    include: {
      creditCard: true,
      transactions: { where: { status: { not: 'CANCELED' } } },
    },
  })

  if (!invoice) return null
  if (invoice.creditCard.userId !== userId) return null

  if (invoice.status !== 'OPEN') {
    throw new Error(`Cannot pay invoice with status ${invoice.status}`)
  }

  const account = await prisma.account.findFirst({ where: { id: input.accountId, userId } })
  if (!account) throw new Error('Account not found or not owned by user')

  const invoiceTotal = invoice.transactions.reduce(
    (sum: number, tx: { value: { toNumber(): number } }) => sum + tx.value.toNumber(),
    0,
  )
  const cardName = invoice.creditCard.name
  const monthLabel = `${String(invoice.month).padStart(2, '0')}/${invoice.year}`

  return prisma.$transaction(async (tx: typeof prisma) => {
    const updatedInvoice = await tx.invoice.update({
      where: { id: invoiceId },
      data: { status: 'PAID', paidAt: input.paidAt },
    })
    await tx.transaction.create({
      data: {
        userId,
        type: 'EXPENSE',
        status: 'PAID',
        description: `Pagamento fatura ${cardName} ${monthLabel}`,
        value: invoiceTotal,
        accountId: input.accountId,
        invoiceId,
        competenceDate: invoice.dueDate,
        dueDate: invoice.dueDate,
        paidAt: input.paidAt,
      },
    })
    return updatedInvoice
  })
}

export function createInstallmentGroupId() {
  return randomUUID()
}
