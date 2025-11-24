import { prisma } from "@/lib/prisma"
import { startOfMonth, endOfMonth } from "date-fns"

export async function getFinanceSummary(userId: string, month: string) {
  const [year, m] = month.split("-")
  const start = startOfMonth(new Date(Number(year), Number(m) - 1))
  const end = endOfMonth(start)

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
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
  const [year, m] = month.split("-")
  const start = startOfMonth(new Date(Number(year), Number(m) - 1))
  const end = endOfMonth(start)

  return prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      date: { gte: start, lte: end }
    },
    _sum: { value: true },
    orderBy: { _sum: { value: "desc" } }
  })
}

export async function getAvailableMonths(userId: string) {
  const txs = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: "asc" },
    select: { date: true },
  })

  const months = [...new Set(
    txs.map(t => t.date.toISOString().slice(0, 7))
  )]

  return months
}
