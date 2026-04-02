import { notFound, redirect } from 'next/navigation'
import { GoalCreateForm } from '@/components/goals/GoalCreateForm'
import { getUserFromRequest } from '@/lib/auth'
import { listAccountsByUser } from '@/modules/accounts/service'
import { getGoalByUser } from '@/modules/goals/service'

function parseGoalId(value: string) {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export default async function GoalEditPage({
  params,
}: {
  params: Promise<{ goalId: string }>
}) {
  const user = await getUserFromRequest()

  if (!user) {
    return redirect('/login?callbackUrl=%2Fdashboard%2Fgoals')
  }

  const { goalId: goalIdParam } = await params
  const goalId = parseGoalId(goalIdParam)

  if (!goalId) {
    return notFound()
  }

  const [goal, accounts] = await Promise.all([
    getGoalByUser(user.id, goalId),
    listAccountsByUser(user.id),
  ])

  if (!goal) {
    return notFound()
  }

  return (
    <GoalCreateForm
      accounts={accounts
        .filter((account) => account.active)
        .map((account) => ({
          id: account.id,
          name: account.name,
        }))}
      initialValues={{
        id: goal.id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        reserveAccountId: goal.reserveAccountId,
        status: goal.status,
        description: goal.description,
      }}
      mode="edit"
    />
  )
}
