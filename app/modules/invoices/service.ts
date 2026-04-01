import { randomUUID } from 'node:crypto'

type InvoiceTransactionLike = {
  id: number
  value?: string | number
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

export async function listInvoicesByCard(creditCardId: number) {
  const { prisma } = await import('@/lib/prisma')

  return prisma.invoice.findMany({
    where: { creditCardId },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    include: {
      creditCard: true,
      transactions: {
        orderBy: [
          { competenceDate: 'asc' },
          { installment: 'asc' },
          { id: 'asc' },
        ],
      },
    },
  })
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

function toCents(value: string | number | undefined) {
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

export function createInstallmentGroupId() {
  return randomUUID()
}
