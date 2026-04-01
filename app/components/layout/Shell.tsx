'use client'

import { Header } from './Header'
import { Sidebar } from './SideBar'

type ShellUser = {
  id: string | number
  name: string | null
  email: string
}

export function Shell({
  children,
  user,
}: {
  children: React.ReactNode
  user: ShellUser
}) {
  return (
    <div data-testid="shell-frame" className="shell-frame min-h-screen">
      <div className="shell-frame__inner flex min-h-screen">
        <Sidebar user={user} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header user={user} />
          <main
            data-testid="shell-content"
            className="shell-content flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-8"
          >
            <div className="mx-auto w-full max-w-[1600px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
