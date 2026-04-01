'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, User } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const mobileNavItems = [
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

export function Header() {
  const { user, logout } = useAuth()

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U'

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur-xl md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
            Workspace financeiro
          </p>
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl tracking-tight text-foreground">
              MyFinance
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/40 sm:inline-flex" />
            <span className="hidden text-sm text-muted-foreground sm:inline">
              controle patrimonial
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Abrir menu da conta"
                className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <span className="hidden text-sm font-medium text-foreground sm:block">
                  {user.name || user.email}
                </span>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Minha conta</DropdownMenuLabel>

                <DropdownMenuItem className="flex items-center gap-2">
                  <User size={14} />
                  Perfil
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="flex cursor-pointer items-center gap-2 text-destructive"
                  onClick={logout}
                >
                  <LogOut size={14} />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <nav
        aria-label="Navegação principal"
        className="mt-3 flex gap-2 overflow-x-auto border-t border-border/70 pt-3 md:hidden"
      >
        {mobileNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex shrink-0 items-center rounded-full border border-border/70 bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
