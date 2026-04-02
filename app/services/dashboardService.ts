import { endOfMonth, startOfMonth } from 'date-fns'
import { prisma } from '@/lib/prisma'
import type {
  DashboardAccountSnapshot,
  DashboardCategorySnapshot,
  DashboardInvoiceSnapshot,
  DashboardPendingItem,
  DashboardPeriod,
  DashboardReport,
  DashboardSummary,
  DashboardTransferSnapshot,
} from '@/modules/dashboard'
import { createDashboardPeriod } from '@/modules/dashboard'
import { reconcileInvoiceRecord } from '@/modules/invoices/service'

type MonthlyTransaction = {
  id: number
  type: 'INCOME' | 'EXPENSE'
  description: string
  value: string | number
  status: 'PLANNED' | 'PENDING' | 'PAID' | 'CANCELED'
  competenceDate: Date
  dueDate: Date
  categoryId?: number
  category?: {
    id: number
    name: string
    type: 'INCOME' | 'EXPENSE'
  } | null
  account?: {
    id: number
    name: string
    type: 'BANK' | 'WALLET' | 'OTHER'
  } | null
}

type MonthlyTransfer = {
  id: number
  description: string
  amount: string | number
  competenceDate: Date
  dueDate: Date
  status: 'PLANNED' | 'PENDING' | 'PAID' | 'CANCELED'
  sourceAccount?: { id: number; name: string } | null
  destinationAccount?: { id: number; name: string } | null
}

type MonthlyInvoice = {
  id: number
  month: number
  year: number
  status: 'OPEN' | 'PAID' | 'CANCELED'
  total: string | number
  dueDate: Date
  creditCard?: { id: number; name: string } | null
  transactions: Array<{
    id: number
    value: string | number | { toString(): string }
    status: string | null
  }>
}

type MonthlyAccount = {
  id: number
  name: string
  type: 'BANK' | 'WALLET' | 'OTHER'
  initialBalance: string | number
  active: boolean
}

function getMonthWindow(month: string) {
  const [year, m] = month.split('-')
  const start = startOfMonth(new Date(Number(year), Number(m) - 1))
  const end = endOfMonth(start)

  return { start, end }
}

function formatAmount(value: string | number | null | undefined) {
  return Number(value ?? 0).toFixed(2)
}

function toMonthKey(date: Date) {
  return date.toISOString().slice(0, 7)
}

function buildPeriod(month: string): DashboardPeriod {
  return createDashboardPeriod(month)
}

function aggregateSummary(transactions: MonthlyTransaction[]) {
  const forecastTransactions = transactions.filter((transaction) =>
    ['PLANNED', 'PENDING'].includes(transaction.status),
  )
  const realizedTransactions = transactions.filter((transaction) => transaction.status === 'PAID')

  const forecastIncome = forecastTransactions
    .filter((transaction) => transaction.type === 'INCOME')
    .reduce((total, transaction) => total + Number(transaction.value), 0)
  const forecastExpense = forecastTransactions
    .filter((transaction) => transaction.type === 'EXPENSE')
    .reduce((total, transaction) => total + Number(transaction.value), 0)
  const realizedIncome = realizedTransactions
    .filter((transaction) => transaction.type === 'INCOME')
    .reduce((total, transaction) => total + Number(transaction.value), 0)
  const realizedExpense = realizedTransactions
    .filter((transaction) => transaction.type === 'EXPENSE')
    .reduce((total, transaction) => total + Number(transaction.value), 0)

  const summary: DashboardSummary = {
    forecastIncome: formatAmount(forecastIncome),
    forecastExpense: formatAmount(forecastExpense),
    realizedIncome: formatAmount(realizedIncome),
    realizedExpense: formatAmount(realizedExpense),
    forecastBalance: formatAmount(forecastIncome - forecastExpense),
    realizedBalance: formatAmount(realizedIncome - realizedExpense),
  }

  return summary
}

function buildPendingItems(
  transactions: MonthlyTransaction[],
  transfers: MonthlyTransfer[],
): DashboardPendingItem[] {
  const pendingTransactions = transactions
    .filter(
      (transaction): transaction is MonthlyTransaction & { status: 'PLANNED' | 'PENDING' } =>
        transaction.status === 'PLANNED' || transaction.status === 'PENDING',
    )
    .map((transaction) => ({
      id: transaction.id,
      description: transaction.description,
      amount: formatAmount(transaction.value),
      dueDate: transaction.dueDate,
      status: transaction.status,
    }))

  const pendingTransfers = transfers
    .filter(
      (transfer): transfer is MonthlyTransfer & { status: 'PLANNED' | 'PENDING' } =>
        transfer.status === 'PLANNED' || transfer.status === 'PENDING',
    )
    .map((transfer) => ({
      id: transfer.id,
      description: transfer.description,
      amount: formatAmount(transfer.amount),
      dueDate: transfer.dueDate,
      status: transfer.status,
    }))

  return [...pendingTransactions, ...pendingTransfers].sort(
    (left, right) => left.dueDate.getTime() - right.dueDate.getTime(),
  )
}

function buildCategorySnapshots(transactions: MonthlyTransaction[]) {
  const totals = new Map<
    number,
    {
      categoryId: number
      categoryName: string
      type: 'INCOME' | 'EXPENSE'
      total: number
    }
  >()

  for (const transaction of transactions) {
    if (transaction.status === 'CANCELED' || !transaction.category) {
      continue
    }

    const key = transaction.category.id
    const current = totals.get(key)
    const amount = Number(transaction.value)

    if (!current) {
      totals.set(key, {
        categoryId: transaction.category.id,
        categoryName: transaction.category.name,
        type: transaction.category.type,
        total: amount,
      })
      continue
    }

    current.total += amount
  }

  return [...totals.values()]
    .sort((left, right) => right.total - left.total)
    .map<DashboardCategorySnapshot>((entry) => ({
      categoryId: entry.categoryId,
      categoryName: entry.categoryName,
      type: entry.type,
      total: formatAmount(entry.total),
    }))
}

function buildTransferSnapshots(transfers: MonthlyTransfer[]): DashboardTransferSnapshot[] {
  return transfers
    .filter((transfer) => transfer.status !== 'CANCELED')
    .map<DashboardTransferSnapshot>((transfer) => ({
      transferId: transfer.id,
      description: transfer.description,
      amount: formatAmount(transfer.amount),
      competenceDate: transfer.competenceDate,
      dueDate: transfer.dueDate,
      status: transfer.status,
      sourceAccountName: transfer.sourceAccount?.name ?? '—',
      destinationAccountName: transfer.destinationAccount?.name ?? '—',
    }))
}

function buildInvoiceSnapshots(invoices: MonthlyInvoice[]): DashboardInvoiceSnapshot[] {
  return invoices
    .filter((invoice) => invoice.status !== 'CANCELED')
    .map<DashboardInvoiceSnapshot>((invoice) => {
      const reconciledInvoice = reconcileInvoiceRecord(invoice)

      return {
        invoiceId: invoice.id,
        cardId: invoice.creditCard?.id ?? 0,
        cardName: invoice.creditCard?.name ?? '—',
        month: invoice.month,
        year: invoice.year,
        status: invoice.status,
        dueDate: invoice.dueDate,
        total: formatAmount(reconciledInvoice.total),
      }
    })
}

function buildAccountSnapshots(
  accounts: MonthlyAccount[],
  transactions: MonthlyTransaction[],
  transfers: MonthlyTransfer[],
) {
  const accountBalances = new Map<number, number>()

  for (const account of accounts) {
    accountBalances.set(account.id, Number(account.initialBalance))
  }

  for (const transaction of transactions) {
    if (transaction.status !== 'PAID' || !transaction.account) {
      continue
    }

    const current = accountBalances.get(transaction.account.id) ?? 0
    const delta = transaction.type === 'INCOME' ? Number(transaction.value) : -Number(transaction.value)
    accountBalances.set(transaction.account.id, current + delta)
  }

  for (const transfer of transfers) {
    if (transfer.status !== 'PAID') {
      continue
    }

    const sourceBalance = accountBalances.get(transfer.sourceAccount?.id ?? -1) ?? 0
    const destinationBalance = accountBalances.get(transfer.destinationAccount?.id ?? -1) ?? 0

    if (transfer.sourceAccount) {
      accountBalances.set(transfer.sourceAccount.id, sourceBalance - Number(transfer.amount))
    }

    if (transfer.destinationAccount) {
      accountBalances.set(transfer.destinationAccount.id, destinationBalance + Number(transfer.amount))
    }
  }

  return accounts.map<DashboardAccountSnapshot>((account) => ({
    id: account.id,
    name: account.name,
    type: account.type,
    balance: formatAmount(accountBalances.get(account.id) ?? 0),
    active: account.active,
  }))
}

export async function getFinanceSummary(userId: string, month: string) {
  const { start, end } = getMonthWindow(month)

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      status: {
        not: 'CANCELED',
      },
      competenceDate: {
        gte: start,
        lte: end,
      },
    },
  })

  const income = transactions
    .filter((transaction: (typeof transactions)[number]) => transaction.type === 'INCOME')
    .reduce(
      (total: number, transaction: (typeof transactions)[number]) => total + Number(transaction.value),
      0,
    )

  const expense = transactions
    .filter((transaction: (typeof transactions)[number]) => transaction.type === 'EXPENSE')
    .reduce(
      (total: number, transaction: (typeof transactions)[number]) => total + Number(transaction.value),
      0,
    )

  return {
    income,
    expense,
    balance: income - expense,
  }
}

export async function getCategoryTotals(userId: string, month: string) {
  const { start, end } = getMonthWindow(month)

  return prisma.transaction.groupBy({
    by: ['categoryId'],
    where: {
      userId,
      status: {
        not: 'CANCELED',
      },
      competenceDate: { gte: start, lte: end },
    },
    _sum: { value: true },
    orderBy: { _sum: { value: 'desc' } },
  })
}

export async function getAvailableMonths(userId: string) {
  const [transactions, transfers, invoices] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        status: { not: 'CANCELED' },
      },
      select: { competenceDate: true },
    }),
    prisma.transfer.findMany({
      where: {
        userId,
        status: { not: 'CANCELED' },
      },
      select: { competenceDate: true },
    }),
    prisma.invoice.findMany({
      where: {
        creditCard: {
          userId,
        },
      },
      select: { dueDate: true },
    }),
  ])

  const months = new Set<string>()

  for (const transaction of transactions) {
    months.add(toMonthKey(transaction.competenceDate))
  }

  for (const transfer of transfers) {
    months.add(toMonthKey(transfer.competenceDate))
  }

  for (const invoice of invoices) {
    months.add(toMonthKey(invoice.dueDate))
  }

  return [...months].sort()
}

export async function getDashboardReport(userId: string, month: string): Promise<DashboardReport> {
  const { start, end } = getMonthWindow(month)

  const [transactions, transfers, invoices, accounts] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        status: {
          not: 'CANCELED',
        },
        competenceDate: {
          gte: start,
          lte: end,
        },
      },
      select: {
        id: true,
        type: true,
        description: true,
        value: true,
        status: true,
        competenceDate: true,
        dueDate: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        account: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: [{ competenceDate: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.transfer.findMany({
      where: {
        userId,
        status: {
          not: 'CANCELED',
        },
        competenceDate: {
          gte: start,
          lte: end,
        },
      },
      select: {
        id: true,
        description: true,
        amount: true,
        competenceDate: true,
        dueDate: true,
        status: true,
        sourceAccount: {
          select: {
            id: true,
            name: true,
          },
        },
        destinationAccount: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ competenceDate: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.invoice.findMany({
      where: {
        creditCard: {
          userId,
        },
        dueDate: {
          gte: start,
          lte: end,
        },
      },
      select: {
        id: true,
        month: true,
        year: true,
        status: true,
        total: true,
        dueDate: true,
        creditCard: {
          select: {
            id: true,
            name: true,
          },
        },
        transactions: {
          select: {
            id: true,
            value: true,
            status: true,
          },
          orderBy: [{ competenceDate: 'asc' }, { installment: 'asc' }, { id: 'asc' }],
        },
      },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.account.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        type: true,
        initialBalance: true,
        active: true,
      },
    }),
  ])

  const normalizedTransactions: MonthlyTransaction[] = transactions.map((transaction) => ({
    id: transaction.id,
    type: transaction.type,
    description: transaction.description,
    value: transaction.value.toString(),
    status: transaction.status,
    competenceDate: transaction.competenceDate,
    dueDate: transaction.dueDate,
    categoryId: transaction.categoryId,
    category: transaction.category
      ? {
          id: transaction.category.id,
          name: transaction.category.name,
          type: transaction.category.type,
        }
      : null,
    account: transaction.account
      ? {
          id: transaction.account.id,
          name: transaction.account.name,
          type: transaction.account.type,
        }
      : null,
  }))

  const normalizedTransfers: MonthlyTransfer[] = transfers.map((transfer) => ({
    id: transfer.id,
    description: transfer.description ?? 'Transferência interna',
    amount: transfer.amount.toString(),
    competenceDate: transfer.competenceDate,
    dueDate: transfer.dueDate,
    status: transfer.status,
    sourceAccount: transfer.sourceAccount
      ? { id: transfer.sourceAccount.id, name: transfer.sourceAccount.name }
      : null,
    destinationAccount: transfer.destinationAccount
      ? { id: transfer.destinationAccount.id, name: transfer.destinationAccount.name }
      : null,
  }))

  const normalizedInvoices: MonthlyInvoice[] = invoices.map((invoice) => ({
    id: invoice.id,
    month: invoice.month,
    year: invoice.year,
    status: invoice.status,
    total: invoice.total.toString(),
    dueDate: invoice.dueDate,
    creditCard: invoice.creditCard
      ? { id: invoice.creditCard.id, name: invoice.creditCard.name }
      : null,
    transactions: invoice.transactions.map((transaction) => ({
      id: transaction.id,
      value: transaction.value.toString(),
      status: transaction.status,
    })),
  }))

  const normalizedAccounts: MonthlyAccount[] = accounts.map((account) => ({
    id: account.id,
    name: account.name,
    type: account.type,
    initialBalance: account.initialBalance.toString(),
    active: account.active,
  }))

  const report: DashboardReport = {
    period: buildPeriod(month),
    summary: aggregateSummary(normalizedTransactions),
    pending: buildPendingItems(normalizedTransactions, normalizedTransfers),
    accounts: buildAccountSnapshots(normalizedAccounts, normalizedTransactions, normalizedTransfers),
    categories: buildCategorySnapshots(normalizedTransactions),
    cardInvoices: buildInvoiceSnapshots(normalizedInvoices),
    transfers: buildTransferSnapshots(normalizedTransfers),
  }

  return report
}
