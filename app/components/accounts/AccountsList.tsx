import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { AccountRecord } from '@/modules/accounts'
import { LandmarkIcon, WalletIcon, CreditCardIcon, PaletteIcon } from 'lucide-react'
import Link from 'next/link'

type AccountsListProps = {
  accounts: AccountRecord[]
}

function getTypeLabel(type: AccountRecord['type']) {
  switch (type) {
    case 'BANK':
      return 'Banco'
    case 'WALLET':
      return 'Carteira'
    default:
      return 'Outro'
  }
}

function getTypeIcon(type: AccountRecord['type']) {
  switch (type) {
    case 'BANK':
      return <LandmarkIcon className="h-4 w-4" />
    case 'WALLET':
      return <WalletIcon className="h-4 w-4" />
    default:
      return <CreditCardIcon className="h-4 w-4" />
  }
}

function formatCurrency(value: string) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function AccountsList({ accounts }: AccountsListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {accounts.map((account) => (
        <Card
          key={account.id}
          className="border-muted/70 bg-card/90 p-4 shadow-sm transition-shadow hover:shadow-md"
          style={
            account.color
              ? { boxShadow: `0 0 0 1px ${account.color}22, 0 12px 28px ${account.color}14` }
              : undefined
          }
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border bg-muted text-muted-foreground',
                  account.color && 'border-transparent text-white',
                )}
                style={account.color ? { backgroundColor: account.color } : undefined}
                aria-hidden="true"
              >
                {getTypeIcon(account.type)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold leading-none">{account.name}</h2>
                  <Badge variant={account.active ? 'secondary' : 'outline'}>
                    {account.active ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">Tipo: {getTypeLabel(account.type)}</p>

                <p className="text-sm font-medium">{formatCurrency(account.initialBalance)}</p>
              </div>
            </div>

            <Badge variant="outline">{account.type}</Badge>
          </div>

          <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
            {account.institution ? <p>Instituição: {account.institution}</p> : null}
            <div className="flex flex-wrap gap-2">
              {account.color ? (
                <Badge variant="outline" className="gap-1">
                  <PaletteIcon className="h-3.5 w-3.5" />
                  Cor {account.color}
                </Badge>
              ) : null}
              {account.icon ? <Badge variant="outline">Ícone: {account.icon}</Badge> : null}
            </div>
            <div className="pt-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/dashboard/accounts/${account.id}`} aria-label={`Editar ${account.name}`}>
                  Editar
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
