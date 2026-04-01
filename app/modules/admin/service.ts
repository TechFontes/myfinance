import { prisma } from '@/lib/prisma'
import type {
  AdminFinancialAccount,
  AdminFinancialCard,
  AdminFinancialGoal,
  AdminFinancialInvoice,
  AdminFinancialOverview,
  AdminFinancialTransaction,
  AdminUserListItem,
  AdminUserUpdateInput,
} from './contracts'

function toMoney(value: string | number | null | undefined) {
  return Number(value ?? 0).toFixed(2)
}

export async function listAdminUsers(): Promise<AdminUserListItem[]> {
  return prisma.user.findMany({
    orderBy: [{ createdAt: 'desc' }, { email: 'asc' }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      blockedAt: true,
      blockedReason: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function updateAdminUser(
  userId: string,
  input: AdminUserUpdateInput,
): Promise<AdminUserListItem | null> {
  const existingUser = await prisma.user.findFirst({
    where: { id: userId },
  })

  if (!existingUser) {
    return null
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.role !== undefined ? { role: input.role } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      blockedAt: true,
      blockedReason: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function blockUserForAdmin(
  userId: string,
  reason: string,
): Promise<AdminUserListItem | null> {
  const existingUser = await prisma.user.findFirst({
    where: { id: userId },
  })

  if (!existingUser) {
    return null
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      blockedAt: new Date(),
      blockedReason: reason.trim(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      blockedAt: true,
      blockedReason: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function unblockUserForAdmin(userId: string): Promise<AdminUserListItem | null> {
  const existingUser = await prisma.user.findFirst({
    where: { id: userId },
  })

  if (!existingUser) {
    return null
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      blockedAt: null,
      blockedReason: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      blockedAt: true,
      blockedReason: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function getAdminFinancialOverview(
  userId: string,
): Promise<AdminFinancialOverview | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      blockedAt: true,
      blockedReason: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!user) {
    return null
  }

  const [accounts, cards, transactions, invoices, goals] = await Promise.all([
    prisma.account.findMany({
      where: { userId },
      orderBy: [{ active: 'desc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        type: true,
        initialBalance: true,
        active: true,
        institution: true,
        color: true,
        icon: true,
      },
    }),
    prisma.creditCard.findMany({
      where: { userId },
      orderBy: [{ active: 'desc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        limit: true,
        closeDay: true,
        dueDay: true,
        active: true,
      },
    }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: [{ competenceDate: 'desc' }, { dueDate: 'desc' }, { createdAt: 'desc' }],
      take: 20,
      select: {
        id: true,
        type: true,
        description: true,
        value: true,
        status: true,
        competenceDate: true,
        dueDate: true,
        paidAt: true,
        category: {
          select: {
            name: true,
          },
        },
        account: {
          select: {
            name: true,
          },
        },
        creditCard: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.invoice.findMany({
      where: {
        creditCard: {
          userId,
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      select: {
        id: true,
        month: true,
        year: true,
        status: true,
        total: true,
        dueDate: true,
        creditCard: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.goal.findMany({
      where: { userId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        name: true,
        targetAmount: true,
        status: true,
        reserveAccountId: true,
      },
    }),
  ])

  const transactionsByStatus = transactions.reduce(
    (accumulator, transaction) => {
      accumulator[transaction.status] += 1
      return accumulator
    },
    {
      PLANNED: 0,
      PENDING: 0,
      PAID: 0,
      CANCELED: 0,
    },
  )

  const activeAccounts = accounts.filter((account) => account.active).length
  const activeCards = cards.filter((card) => card.active).length
  const activeGoals = goals.filter((goal) => goal.status === 'ACTIVE').length
  const completedGoals = goals.filter((goal) => goal.status === 'COMPLETED').length
  const canceledGoals = goals.filter((goal) => goal.status === 'CANCELED').length

  return {
    user,
    summary: {
      accounts: accounts.length,
      activeAccounts,
      cards: cards.length,
      activeCards,
      transactions: transactions.length,
      plannedTransactions: transactionsByStatus.PLANNED,
      pendingTransactions: transactionsByStatus.PENDING,
      paidTransactions: transactionsByStatus.PAID,
      canceledTransactions: transactionsByStatus.CANCELED,
      invoices: invoices.length,
      goals: goals.length,
      activeGoals,
      completedGoals,
      canceledGoals,
    },
    accounts: accounts.map<AdminFinancialAccount>((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
      initialBalance: toMoney(account.initialBalance),
      active: account.active,
      institution: account.institution ?? null,
      color: account.color ?? null,
      icon: account.icon ?? null,
    })),
    cards: cards.map<AdminFinancialCard>((card) => ({
      id: card.id,
      name: card.name,
      limit: toMoney(card.limit),
      closeDay: card.closeDay,
      dueDay: card.dueDay,
      active: card.active,
    })),
    transactions: {
      total: transactions.length,
      items: transactions.map<AdminFinancialTransaction>((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        description: transaction.description,
        value: toMoney(transaction.value),
        status: transaction.status,
        competenceDate: transaction.competenceDate,
        dueDate: transaction.dueDate,
        paidAt: transaction.paidAt ?? null,
        categoryName: transaction.category?.name ?? null,
        accountName: transaction.account?.name ?? null,
        creditCardName: transaction.creditCard?.name ?? null,
      })),
    },
    invoices: invoices.map<AdminFinancialInvoice>((invoice) => ({
      id: invoice.id,
      month: invoice.month,
      year: invoice.year,
      status: invoice.status,
      total: toMoney(invoice.total),
      dueDate: invoice.dueDate,
      creditCardName: invoice.creditCard?.name ?? null,
    })),
    goals: goals.map<AdminFinancialGoal>((goal) => ({
      id: goal.id,
      name: goal.name,
      targetAmount: toMoney(goal.targetAmount),
      status: goal.status,
      reserveAccountId: goal.reserveAccountId,
    })),
  }
}
