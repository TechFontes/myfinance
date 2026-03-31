import type { CategoryType } from '@/types/domain'
import { categoryTypes } from '@/types/domain'

export { categoryTypes }

export type CategoryRecord = {
  id: number
  userId: string
  name: string
  type: CategoryType
  parentId: number | null
  active: boolean
}
