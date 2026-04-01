'use client'

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
            <span className="text-lg font-semibold tracking-tight text-foreground">
              MyFinance
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/40 sm:inline-flex" />
            <span className="hidden text-sm text-muted-foreground sm:inline">
              controle editorial
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none transition-opacity hover:opacity-80">
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
    </header>
  )
}
