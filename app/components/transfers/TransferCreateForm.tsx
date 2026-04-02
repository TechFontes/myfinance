import { TransferForm } from './TransferForm'

type TransferCreateFormProps = {
  accounts: Array<{
    id: number
    name: string
  }>
}

export function TransferCreateForm({ accounts }: TransferCreateFormProps) {
  return <TransferForm accounts={accounts} mode="create" />
}
