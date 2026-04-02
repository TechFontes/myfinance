import { redirect } from 'next/navigation'

import { CardCreateForm } from '@/components/cards/CardCreateForm'
import { getUserFromRequest } from '@/lib/auth'

export default async function CardCreatePage() {
  const user = await getUserFromRequest()

  if (!user) {
    return redirect('/login?callbackUrl=%2Fdashboard%2Fcards%2Fnew')
  }

  return <CardCreateForm />
}
