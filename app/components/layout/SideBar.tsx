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
    <aside className="hidden w-72 shrink-0 flex-col border-r border-border/70 bg-background/90 px-5 py-6 backdrop-blur md:flex">
      <div className="rounded-3xl border border-border/70 bg-card/85 p-4 shadow-sm shadow-black/5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
            MF
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
              Workspace financeiro
            </p>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              MyFinance
            </h2>
          </div>
        </div>
        <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
          Operação diária, visão consolidada e decisões rápidas em um único espaço.
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
                'block rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                isActive &&
                  'bg-foreground text-background hover:bg-foreground hover:text-background'
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
