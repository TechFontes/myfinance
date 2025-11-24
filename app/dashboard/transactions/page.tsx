import { NewTransactionButton } from "@/components/newTransactionButton"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import { cookies } from "next/headers"
import { DBTransaction } from "@/types/db"


async function getTransactions():Promise<DBTransaction[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  const token = (await cookies()).get("auth_token")?.value

  const res = await fetch(`${baseUrl}/api/transactions`, {
    method: "GET",
    headers: {
      Cookie: `auth_token=${token}`,
    },
    cache: "no-store",
  })

  if (!res.ok) return []

  return res.json()
}

export default async function TransactionsPage() {
  const transactions = (await getTransactions()).sort((a, b)=> new Date(a.date).getTime() < new Date(b.date).getTime()?1:-1)
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-muted-foreground">Veja e gerencie suas receitas e despesas</p>
        </div>

        <NewTransactionButton />
      </div>

      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center md:items-end">
        <div className="w-full md:w-1/3">
          <label className="text-sm font-medium">Buscar</label>
          <Input placeholder="Descrição, categoria…" />
        </div>

        <div className="w-full md:w-1/4">
          <label className="text-sm font-medium">Tipo</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="INCOME">Receitas</SelectItem>
              <SelectItem value="EXPENSE">Despesas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-1/4">
          <label className="text-sm font-medium">Mês</label>
          <Input type="month" />
        </div>
      </Card>

      {/* TABLE */}
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b">
            <tr>
              <th className="p-3 text-left font-medium">Descrição</th>
              <th className="p-3 text-left font-medium">Categoria</th>
              <th className="p-3 text-left font-medium">Tipo</th>
              <th className="p-3 text-left font-medium">Valor</th>
              <th className="p-3 text-left font-medium">Data</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((t: any) => (
              <tr key={t.id} className="border-b hover:bg-muted/30">
                <td className="p-3">{t.description}</td>
                <td className="p-3">{t.category?.name ?? "—"}</td>

                <td className="p-3">
                  {t.type === "INCOME" ? (
                    <Badge className="bg-success text-success-foreground flex items-center gap-1">
                      <ArrowUpIcon size={14} />
                      Receita
                    </Badge>
                  ) : (
                    <Badge className="bg-destructive text-destructive-foreground flex items-center gap-1">
                      <ArrowDownIcon size={14} />
                      Despesa
                    </Badge>
                  )}
                </td>

                <td className="p-3 font-semibold">
                  {t.type === "INCOME" ? "+" : "-"}{" "}
                  {Number(t.value).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>

                <td className="p-3">
                  {new Date(t.date).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
