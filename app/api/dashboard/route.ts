import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getDashboardReport } from "@/services/dashboardService"

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const month = req.nextUrl.searchParams.get("month") 
    ?? new Date().toISOString().slice(0, 7)

  const report = await getDashboardReport(user.id, month)

  return NextResponse.json(report)
}
