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
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-background)_97%,transparent),color-mix(in_oklab,var(--color-card)_88%,transparent))] px-4 py-5 backdrop-blur md:flex">
      <div className="rounded-[1.75rem] border border-border/60 bg-card/75 p-4 shadow-[0_18px_50px_-48px_rgba(15,23,42,0.32)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[1.1rem] border border-border/70 bg-background text-sm font-semibold text-foreground">
            MF
          </div>
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
              Workspace financeiro
            </p>
            <h2 className="font-serif text-xl tracking-tight text-foreground">
              MyFinance
            </h2>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          <span>Controle patrimonial</span>, leitura editorial e visão consolidada em uma única mesa.
        </p>
      </div>

      <nav className="mt-5 space-y-1">
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
                'block rounded-2xl border border-transparent px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-border/60 hover:bg-card/80 hover:text-foreground',
                isActive &&
                  'border-border/70 bg-card/80 text-foreground shadow-[0_12px_30px_-32px_rgba(15,23,42,0.28)] hover:bg-card/80 hover:text-foreground'
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
