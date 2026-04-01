import { describe, expect, it } from 'vitest'
import {
  accountTypes,
  accountCreateSchema,
  accountUpdateSchema,
} from '@/modules/accounts'

describe('accounts module foundation', () => {
  it('exports supported account types', () => {
    expect(accountTypes).toEqual(['BANK', 'WALLET', 'OTHER'])
  })

  it('validates account creation payloads with PRD fields', () => {
    const payload = accountCreateSchema.parse({
      name: 'Nubank',
      type: 'BANK',
      initialBalance: '1200.50',
      institution: 'Nubank',
      color: '#7a2cff',
      icon: 'wallet',
    })

    expect(payload).toMatchObject({
      name: 'Nubank',
      type: 'BANK',
      initialBalance: '1200.50',
      institution: 'Nubank',
      color: '#7a2cff',
      icon: 'wallet',
    })
  })

  it('validates account update payloads with active state', () => {
    const payload = accountUpdateSchema.parse({
      name: 'Carteira',
      active: false,
    })

    expect(payload).toMatchObject({
      name: 'Carteira',
      active: false,
    })
  })
})
