import { redirect } from 'next/navigation'

import { GoalCreateForm } from '@/components/goals/GoalCreateForm'
import { getUserFromRequest } from '@/lib/auth'
import { listAccountsByUser } from '@/modules/accounts/service'

export default async function NewGoalPage() {
  const user = await getUserFromRequest()

  if (!user) {
    return redirect('/login?callbackUrl=%2Fdashboard%2Fgoals%2Fnew')
  }

  const accounts = await listAccountsByUser(user.id)

  return (
    <GoalCreateForm
      accounts={accounts.map((account) => ({
        id: account.id,
        name: account.name,
      }))}
    />
  )
}
