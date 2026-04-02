import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { CreditCardRecord } from '@/modules/cards'
import { CreditCardIcon, PaletteIcon, WalletCardsIcon } from 'lucide-react'

type CardsListProps = {
  cards: CreditCardRecord[]
}

function formatCurrency(value: string) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function getCardIcon(icon: CreditCardRecord['icon']) {
  if (!icon) {
    return <CreditCardIcon className="h-4 w-4" />
  }

  return <WalletCardsIcon className="h-4 w-4" />
}

export function CardsList({ cards }: CardsListProps) {
  if (cards.length === 0) {
    return (
      <Card className="border-dashed p-6 text-sm text-muted-foreground">
        Nenhum cartão cadastrado ainda.
      </Card>
    )
  }

  return (
    <div data-testid="cards-list" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <Card
          key={card.id}
          className="border-muted/70 bg-card/90 p-4 shadow-sm transition-shadow hover:shadow-md"
          style={
            card.color
              ? { boxShadow: `0 0 0 1px ${card.color}22, 0 12px 28px ${card.color}14` }
              : undefined
          }
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                aria-hidden="true"
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border bg-muted text-muted-foreground',
                  card.color && 'border-transparent text-white',
                )}
                style={card.color ? { backgroundColor: card.color } : undefined}
              >
                {getCardIcon(card.icon)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold leading-none">{card.name}</h2>
                  <Badge variant={card.active ? 'secondary' : 'outline'}>
                    {card.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">Limite: {formatCurrency(card.limit)}</p>
              </div>
            </div>

            <Badge variant="outline">Cartão</Badge>
          </div>

          <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
            <p>Fechamento dia {card.closeDay}</p>
            <p>Vencimento dia {card.dueDay}</p>
            <div className="flex flex-wrap gap-2">
              {card.color ? (
                <Badge variant="outline" className="gap-1">
                  <PaletteIcon className="h-3.5 w-3.5" />
                  Cor {card.color}
                </Badge>
              ) : null}
              {card.icon ? <Badge variant="outline">Ícone: {card.icon}</Badge> : null}
            </div>
            <div className="pt-2">
              <Link
                aria-label={`Editar ${card.name}`}
                className="inline-flex items-center rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                href={`/dashboard/cards/${card.id}/edit`}
              >
                Editar
              </Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
