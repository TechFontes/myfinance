import type { AccountType } from '@/types/domain'
import { accountTypes } from '@/types/domain'

export { accountTypes }

export type AccountRecord = {
  id: number
  userId: string
  name: string
  type: AccountType
  initialBalance: string
  institution: string | null
  color: string | null
  icon: string | null
  active: boolean
}

export type AccountCreateInput = {
  name: string
  type: AccountType
  initialBalance?: string
  institution?: string
  color?: string
  icon?: string
}

export type AccountUpdateInput = Partial<AccountCreateInput> & {
  active?: boolean
}
