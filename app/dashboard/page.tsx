import { Card } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, WalletIcon } from "lucide-react"
import { getUserFromRequest } from "@/lib/auth"
import { getFinanceSummary, getCategoryTotals, getAvailableMonths } from "@/services/dashboardService"

async function getDashboardData(month: string) {
  const user = await getUserFromRequest()
  if (!user) {
    return {summary: {income: 0, expense: 0, balance: 0}, categories: [], months: []
    }
  }
    const summary = await getFinanceSummary(user.id, month)
    const categories = await getCategoryTotals(user.id, month)
    const months = await getAvailableMonths(user.id)

  return { summary, categories, months }
}

export default async function DashboardPage() {
  const currentMonth = new Date().toISOString().slice(0, 7)
  const data = await getDashboardData(currentMonth)

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
              {data.categories.map((c) => (
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
