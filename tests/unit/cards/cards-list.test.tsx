// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CardsList } from '@/components/cards/CardsList'

describe('CardsList', () => {
  it('renders card metadata using the new contract', () => {
    render(
      <CardsList
        cards={[
          {
            id: 1,
            userId: 'user-1',
            name: 'Nubank',
            limit: '5000.00',
            closeDay: 10,
            dueDay: 17,
            color: '#7a2cff',
            icon: 'credit-card',
            active: true,
            createdAt: new Date('2026-03-31'),
          },
          {
            id: 2,
            userId: 'user-1',
            name: 'Itaú',
            limit: '12000.00',
            closeDay: 25,
            dueDay: 3,
            color: null,
            icon: null,
            active: false,
            createdAt: new Date('2026-03-31'),
          },
        ]}
      />,
    )

    expect(screen.getByText('Nubank')).toBeInTheDocument()
    expect(screen.getByText('Itaú')).toBeInTheDocument()
    expect(screen.getByText('Fechamento dia 10')).toBeInTheDocument()
    expect(screen.getByText('Vencimento dia 17')).toBeInTheDocument()
    expect(screen.getByText('Ativo')).toBeInTheDocument()
    expect(screen.getByText('Inativo')).toBeInTheDocument()
    expect(screen.getByText(/R\$\s*5\.000,00/)).toBeInTheDocument()
    expect(screen.getByText(/R\$\s*12\.000,00/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Editar Nubank' })).toHaveAttribute(
      'href',
      '/dashboard/cards/1/edit',
    )
  })
})
