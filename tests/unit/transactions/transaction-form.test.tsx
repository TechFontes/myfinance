// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { describe, expect, it } from 'vitest'
import { TransactionForm } from '@/components/transactions/TransactionForm'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}))

describe('transaction form', () => {
  it('renders fields for the new transaction contract without mock data', () => {
    render(<TransactionForm />)

    expect(screen.getByRole('heading', { name: 'Nova transação' })).toBeInTheDocument()
    expect(screen.getByLabelText('Tipo')).toBeInTheDocument()
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument()
    expect(screen.getByLabelText('Valor')).toBeInTheDocument()
    expect(screen.getByLabelText('Categoria ID')).toBeInTheDocument()
    expect(screen.getByLabelText('Conta ID opcional')).toBeInTheDocument()
    expect(screen.getByLabelText('Cartão ID opcional')).toBeInTheDocument()
    expect(screen.getByLabelText('Fatura ID opcional')).toBeInTheDocument()
    expect(screen.getByLabelText('Competência')).toBeInTheDocument()
    expect(screen.getByLabelText('Vencimento')).toBeInTheDocument()
    expect(screen.getByLabelText('Pagamento')).toBeInTheDocument()
    expect(screen.getByLabelText('Status')).toBeInTheDocument()
    expect(screen.getByLabelText('Lançamento fixo')).toBeInTheDocument()
    expect(screen.getByLabelText('Parcela atual')).toBeInTheDocument()
    expect(screen.getByLabelText('Total de parcelas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Salvar transação' })).toBeInTheDocument()
  })
})
