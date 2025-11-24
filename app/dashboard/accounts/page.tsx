import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, WalletIcon, CreditCardIcon, LandmarkIcon } from "lucide-react";
import { cookies } from "next/headers";

// Funções auxiliares
function getTypeIcon(type: string) {
  switch (type) {
    case "BANK":
      return <LandmarkIcon size={18} />;
    case "WALLET":
      return <WalletIcon size={18} />;
    default:
      return <CreditCardIcon size={18} />;
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case "BANK":
      return "Banco";
    case "WALLET":
      return "Carteira";
    default:
      return "Outro";
  }
}

async function getAccounts() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const token = (await cookies()).get("auth_token")?.value;

  const res = await fetch(`${baseUrl}/api/accounts`, {
    method: "GET",
    headers: {
      Cookie: `auth_token=${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) return [];

  return res.json();
}

export default async function AccountsPage() {
  const accounts = await getAccounts();

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contas</h1>
          <p className="text-muted-foreground">
            Gerencie suas contas bancárias e carteiras
          </p>
        </div>

        <Button className="flex items-center gap-2">
          <PlusIcon size={16} />
          Nova conta
        </Button>
      </div>

      {/* LISTA DE CONTAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc: any) => (
          <Card
            key={acc.id}
            className="p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-lg font-semibold">
                {getTypeIcon(acc.type)}
                {acc.name}
              </div>

              {/* Badge */}
              <Badge variant="outline">{getTypeLabel(acc.type)}</Badge>
            </div>

            <div className="text-sm text-muted-foreground">
              Saldo atual
            </div>

            <div className="text-2xl font-bold">
              {Number(acc.balance).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
