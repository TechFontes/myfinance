// components/layout/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { twMerge } from 'tailwind-merge'

const navItems = [
  { href: '/dashboard', label: 'Visão geral' },
  { href: '/dashboard/transactions', label: 'Transações' },
  { href: '/dashboard/accounts', label: 'Contas' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 md:flex">
      <div className="mb-6 text-xl font-bold text-slate-900 dark:text-slate-50">
        MyFinance
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={twMerge(
                'block rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900  dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50',
                isActive &&
                  'bg-slate-900 text-slate-50 hover:text- hover:bg-slate-900 dark:bg-slate-100 dark:text-slate-900'
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
