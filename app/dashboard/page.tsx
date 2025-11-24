import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDownIcon, ArrowUpIcon, WalletIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cookies } from "next/headers"

async function getDashboardData(month: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const token = (await cookies()).get("auth_token")?.value

  const res = await fetch(`${baseUrl}/api/dashboard?month=${month}`, {
    headers: { Cookie: `auth_token=${token}` },
    cache: "no-store"
  })

  if (!res.ok) throw new Error("Failed to load dashboard data")

  return res.json()
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { month?: string }
}) {
  const currentMonth = searchParams.month ?? new Date().toISOString().slice(0, 7)
  const data = await getDashboardData(currentMonth)

  const nextMonth = (() => {
    const [y, m] = currentMonth.split("-").map(Number)
    const dt = new Date(y, m)
    return dt.toISOString().slice(0, 7)
  })()

  const prevMonth = (() => {
    const [y, m] = currentMonth.split("-").map(Number)
    const dt = new Date(y, m - 2)
    return dt.toISOString().slice(0, 7)
  })()

  const monthLabel = new Date(currentMonth + "-01")
    .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão geral</h1>
          <p className="text-muted-foreground">
            Sua situação financeira neste período.
          </p>
        </div>

        {/* Navegação entre meses */}
        <div className="flex items-center gap-2">
          <a href={`/dashboard?month=${prevMonth}`}>
            <ChevronLeft className="cursor-pointer hover:text-primary" />
          </a>

          <span className="font-medium capitalize">
            {monthLabel}
          </span>

          {data.months.includes(nextMonth) && (
            <a href={`/dashboard?month=${nextMonth}`}>
              <ChevronRight className="cursor-pointer hover:text-primary" />
            </a>
          )}
        </div>
      </div>

      {/* RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <Card className="p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <WalletIcon size={20} />
            Saldo do mês
          </div>
          <div className="text-3xl font-bold">
            {data.summary.balance.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
        </Card>

        <Card className="p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <ArrowUpIcon size={20} className="text-success" />
            Receitas
          </div>
          <div className="text-3xl font-bold text-success">
            + {data.summary.income.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
        </Card>

        <Card className="p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <ArrowDownIcon size={20} className="text-destructive" />
            Despesas
          </div>
          <div className="text-3xl font-bold text-destructive">
            - {data.summary.expense.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
        </Card>
      </div>

      {/* VALOR POR CATEGORIA */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          Totais por categoria
        </h2>

        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="p-3 text-left">Categoria</th>
                <th className="p-3 text-left">Valor</th>
              </tr>
            </thead>

            <tbody>
              {data.categories.map((c: any) => (
                <tr key={c.categoryId} className="border-b hover:bg-muted/30">
                  <td className="p-3">{c.categoryId}</td>
                  <td className="p-3 font-semibold">
                    {Number(c._sum.value).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}
