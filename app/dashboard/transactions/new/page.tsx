import { TransactionForm } from '@/components/transactions/TransactionForm'
import { getTransactionFormOptions } from '@/services/transactionFormOptions'

export default async function NewTransactionPage() {
  const options = await getTransactionFormOptions()

  return <TransactionForm options={options} />
}
