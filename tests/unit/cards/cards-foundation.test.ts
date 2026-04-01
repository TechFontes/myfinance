import { describe, expect, it } from 'vitest'
import {
  creditCardVisualFields,
  cardCreateSchema,
  cardUpdateSchema,
} from '@/modules/cards'

describe('cards module foundation', () => {
  it('exports the expected visual fields for credit cards', () => {
    expect(creditCardVisualFields).toEqual(['color', 'icon'])
  })

  it('validates card creation payloads with PRD fields', () => {
    const payload = cardCreateSchema.parse({
      name: 'Nubank',
      limit: '5000.00',
      closeDay: 10,
      dueDay: 15,
      color: '#7a2cff',
      icon: 'credit-card',
    })

    expect(payload).toMatchObject({
      name: 'Nubank',
      limit: '5000.00',
      closeDay: 10,
      dueDay: 15,
      color: '#7a2cff',
      icon: 'credit-card',
      active: true,
    })
  })

  it('validates card update payloads with active state', () => {
    const payload = cardUpdateSchema.parse({
      id: 12,
      active: false,
      color: '#001122',
    })

    expect(payload).toMatchObject({
      id: 12,
      active: false,
      color: '#001122',
    })
  })
})
