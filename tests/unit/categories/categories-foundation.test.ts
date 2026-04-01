import { describe, expect, it } from 'vitest'
import {
  categoryTypes,
  categoryCreateSchema,
  categoryUpdateSchema,
} from '@/modules/categories'

describe('categories module foundation', () => {
  it('exports supported category types', () => {
    expect(categoryTypes).toEqual(['INCOME', 'EXPENSE'])
  })

  it('validates category creation payloads with optional parent', () => {
    const payload = categoryCreateSchema.parse({
      name: 'Moradia',
      type: 'EXPENSE',
      parentId: 10,
    })

    expect(payload).toMatchObject({
      name: 'Moradia',
      type: 'EXPENSE',
      parentId: 10,
    })
  })

  it('validates category updates with active state', () => {
    const payload = categoryUpdateSchema.parse({
      name: 'Investimentos',
      active: false,
    })

    expect(payload).toMatchObject({
      name: 'Investimentos',
      active: false,
    })
  })
})
