'use client'

import { useAuth } from '@/contexts/AuthContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { LogOut, User } from 'lucide-react'

export function Header() {
  const { user, logout } = useAuth()

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U'

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b bg-background/95 backdrop-blur-md">
      
      {/* LOGO / TITULO */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
          M
        </div>

        <span className="text-lg font-semibold tracking-tight">
          MyFinance
        </span>
      </div>

      {/* AÇÕES DO HEADER */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-muted font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <span className="text-sm font-medium hidden sm:block">
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
                className="flex items-center gap-2 text-destructive cursor-pointer"
                onClick={logout}
              >
                <LogOut size={14} />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

    </header>
  )
}
