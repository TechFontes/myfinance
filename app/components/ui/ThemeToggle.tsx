// components/ui/ThemeToggle.tsx
'use client'

import { useTheme } from '@/contexts/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      aria-label="Alternar tema"
      aria-pressed={theme === 'dark'}
      onClick={toggleTheme}
      className="inline-flex h-9 items-center rounded-full border border-border bg-card px-3 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {theme === 'light' ? 'Tema claro' : 'Tema escuro'}
    </button>
  )
}
