import { prisma } from "@/lib/prisma"
import { startOfMonth, endOfMonth } from "date-fns"

function getMonthWindow(month: string) {
  const [year, m] = month.split("-")
  const start = startOfMonth(new Date(Number(year), Number(m) - 1))
  const end = endOfMonth(start)

  return { start, end }
}

export async function getFinanceSummary(userId: string, month: string) {
  const { start, end } = getMonthWindow(month)

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      status: {
        not: "CANCELED",
      },
      competenceDate: {
        gte: start,
        lte: end
      }
    }
  })

  const income = transactions
    .filter(t => t.type === "INCOME")
    .reduce((acc, t) => acc + Number(t.value), 0)

  const expense = transactions
    .filter(t => t.type === "EXPENSE")
    .reduce((acc, t) => acc + Number(t.value), 0)

  return {
    income,
    expense,
    balance: income - expense
  }
}

export async function getCategoryTotals(userId: string, month: string) {
  const { start, end } = getMonthWindow(month)

  return prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      status: {
        not: "CANCELED",
      },
      competenceDate: { gte: start, lte: end }
    },
    _sum: { value: true },
    orderBy: { _sum: { value: "desc" } }
  })
}

export async function getAvailableMonths(userId: string) {
  const txs = await prisma.transaction.findMany({
    where: {
      userId,
      status: {
        not: "CANCELED",
      },
    },
    orderBy: { competenceDate: "asc" },
    select: { competenceDate: true },
  })

  const months = [...new Set(
    txs.map(t => t.competenceDate.toISOString().slice(0, 7))
  )]

  return months
}
