'use client'

import { Header } from './Header'
import { Sidebar } from './SideBar'

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(84,134,109,0.12),_transparent_32%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(245,247,243,1))] text-foreground dark:bg-[radial-gradient(circle_at_top,_rgba(84,134,109,0.18),_transparent_32%),linear-gradient(180deg,_rgba(10,12,11,1),_rgba(17,18,18,1))]">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-[1600px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
