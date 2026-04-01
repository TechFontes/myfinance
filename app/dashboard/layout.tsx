import { Shell } from '@/components/layout/Shell'
import { AuthProvider } from '@/contexts/AuthContext'
import { getUserFromRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUserFromRequest()

  if (!user) {
    redirect('/login?callbackUrl=%2Fdashboard')
  }

  return (
    <AuthProvider
      initialUser={{
        id: String(user.id),
        name: user.name,
        email: user.email,
      }}
    >
      <Shell
        user={{
          id: String(user.id),
          name: user.name,
          email: user.email,
        }}
      >
        {children}
      </Shell>
    </AuthProvider>
  )
}
