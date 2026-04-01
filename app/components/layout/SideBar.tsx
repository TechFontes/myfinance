'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { twMerge } from 'tailwind-merge'

const navItems = [
  { href: '/dashboard', label: 'Visão geral' },
  { href: '/dashboard/transactions', label: 'Transações' },
  { href: '/dashboard/transfers', label: 'Transfers' },
  { href: '/dashboard/cards', label: 'Cartões' },
  { href: '/dashboard/recurrence', label: 'Recorrência' },
  { href: '/dashboard/goals', label: 'Metas' },
  { href: '/dashboard/imports', label: 'Importações' },
  { href: '/dashboard/accounts', label: 'Contas' },
  { href: '/dashboard/categories', label: 'Categorias' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_92%,transparent),color-mix(in_oklab,var(--color-background)_88%,transparent))] px-5 py-6 backdrop-blur md:flex">
      <div className="rounded-[2rem] border border-border/70 bg-card/92 p-5 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.45)]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-foreground text-sm font-semibold text-background">
            MF
          </div>
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
              Workspace financeiro
            </p>
            <h2 className="font-serif text-2xl tracking-tight text-foreground">
              MyFinance
            </h2>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          <span>Controle patrimonial</span>, leitura editorial e visão consolidada em uma única mesa.
        </p>
      </div>

      <nav className="mt-6 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`))

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={twMerge(
                'block rounded-2xl border border-transparent px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-border/70 hover:bg-card hover:text-foreground',
                isActive &&
                  'border-border/80 bg-foreground text-background shadow-[0_16px_40px_-30px_rgba(15,23,42,0.55)] hover:bg-foreground hover:text-background'
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
