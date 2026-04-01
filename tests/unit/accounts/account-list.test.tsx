// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AccountsList } from '@/components/accounts/AccountsList'

describe('AccountsList', () => {
  it('renders account metadata using the new contract', () => {
    render(
      <AccountsList
        accounts={[
          {
            id: 1,
            userId: 'user-1',
            name: 'Nubank',
            type: 'BANK',
            initialBalance: '1250.50',
            institution: 'Nubank',
            color: '#7a2cff',
            icon: 'wallet',
            active: true,
          },
          {
            id: 2,
            userId: 'user-1',
            name: 'Carteira',
            type: 'WALLET',
            initialBalance: '50.00',
            institution: null,
            color: null,
            icon: null,
            active: false,
          },
        ]}
      />,
    )

    expect(screen.getByText('Nubank')).toBeInTheDocument()
    expect(screen.getByText('Carteira')).toBeInTheDocument()
    expect(screen.getByText('Instituição: Nubank')).toBeInTheDocument()
    expect(screen.getByText('Ativa')).toBeInTheDocument()
    expect(screen.getByText('Inativa')).toBeInTheDocument()
    expect(screen.getByText('R$ 1.250,50')).toBeInTheDocument()
    expect(screen.getByText('R$ 50,00')).toBeInTheDocument()
  })
})
