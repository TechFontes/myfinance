// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { RecurrenceList } from '@/components/recurrence/RecurrenceList'

describe('recurrence list', () => {
  it('renders recurring rules with frequency, status and linked accounts', () => {
    render(
      <RecurrenceList
        rules={[
          {
            id: 1,
            description: 'Salario',
            type: 'INCOME',
            value: '5000.00',
            frequency: 'MONTHLY',
            status: 'ACTIVE',
            startDate: new Date('2026-03-01'),
            endDate: null,
            accountLabel: 'Banco Inter',
            creditCardLabel: null,
          },
          {
            id: 2,
            description: 'Assinatura',
            type: 'EXPENSE',
            value: '59.90',
            frequency: 'MONTHLY',
            status: 'INACTIVE',
            startDate: new Date('2026-03-05'),
            endDate: new Date('2026-12-05'),
            accountLabel: null,
            creditCardLabel: 'Nubank',
          },
        ]}
      />,
    )

    expect(screen.getByText('Salario')).toBeInTheDocument()
    expect(screen.getAllByText('Mensal')).toHaveLength(2)
    expect(screen.getByText('Ativa')).toBeInTheDocument()
    expect(screen.getByText('Conta: Banco Inter')).toBeInTheDocument()
    expect(screen.getByText('Cartão: Nubank')).toBeInTheDocument()
    expect(screen.getByText('A recorrência gera lançamentos previstos, não pagamentos automáticos.')).toBeInTheDocument()
  })
})
