import { describe, expectTypeOf, it } from 'vitest'
import type {
  CreditCardCreateInput,
  CreditCardRecord,
  CreditCardUpdateInput,
} from '@/modules/cards'

describe('cards module types', () => {
  it('exports the expected create and update contract shapes', () => {
    expectTypeOf<CreditCardCreateInput>().toMatchTypeOf<{
      name: string
      limit: string
      closeDay: number
      dueDay: number
      color?: string | null
      icon?: string | null
      active?: boolean
    }>()

    expectTypeOf<CreditCardUpdateInput>().toMatchTypeOf<{
      id: number
      name?: string
      limit?: string
      closeDay?: number
      dueDay?: number
      color?: string | null
      icon?: string | null
      active?: boolean
    }>()
  })

  it('exports the expected persisted record shape', () => {
    expectTypeOf<CreditCardRecord>().toMatchTypeOf<{
      id: number
      userId: string
      name: string
      limit: string
      closeDay: number
      dueDay: number
      color: string | null
      icon: string | null
      active: boolean
      createdAt: Date
    }>()
  })
})
