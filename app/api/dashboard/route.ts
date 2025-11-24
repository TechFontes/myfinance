import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getFinanceSummary, getCategoryTotals, getAvailableMonths } from "@/services/dashboardService"

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const month = req.nextUrl.searchParams.get("month") 
    ?? new Date().toISOString().slice(0, 7)

  const summary = await getFinanceSummary(user.id, month)
  const categories = await getCategoryTotals(user.id, month)
  const months = await getAvailableMonths(user.id)

  return NextResponse.json({ summary, categories, months })
}
