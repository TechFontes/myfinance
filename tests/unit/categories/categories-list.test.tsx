// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { CategoriesList } from '@/components/categories/CategoriesList'
import type { CategoryRecord } from '@/modules/categories'

const categories: CategoryRecord[] = [
  { id: 1, userId: 'u1', name: 'Salário', type: 'INCOME', parentId: null, active: true },
  { id: 2, userId: 'u1', name: 'Freelance', type: 'INCOME', parentId: null, active: true },
  { id: 3, userId: 'u1', name: 'Alimentação', type: 'EXPENSE', parentId: null, active: true },
  { id: 4, userId: 'u1', name: 'Supermercado', type: 'EXPENSE', parentId: 3, active: true },
  { id: 5, userId: 'u1', name: 'Restaurante', type: 'EXPENSE', parentId: 3, active: false },
  { id: 6, userId: 'u1', name: 'Moradia', type: 'EXPENSE', parentId: null, active: true },
]

describe('CategoriesList', () => {
  afterEach(() => cleanup())
  it('renders section headers for Receita and Despesa', () => {
    render(<CategoriesList categories={categories} />)

    expect(screen.getByRole('heading', { name: 'Receita' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Despesa' })).toBeInTheDocument()
  })

  it('displays category count per type', () => {
    render(<CategoriesList categories={categories} />)

    const incomeSection = screen.getByRole('region', { name: 'Categorias de Receita' })
    expect(within(incomeSection).getByText('2 categorias')).toBeInTheDocument()

    const expenseSection = screen.getByRole('region', { name: 'Categorias de Despesa' })
    expect(within(expenseSection).getByText('4 categorias')).toBeInTheDocument()
  })

  it('renders categories grouped by type with children under parents', () => {
    render(<CategoriesList categories={categories} />)

    const incomeSection = screen.getByRole('region', { name: 'Categorias de Receita' })
    expect(within(incomeSection).getByText('Salário')).toBeInTheDocument()
    expect(within(incomeSection).getByText('Freelance')).toBeInTheDocument()

    const expenseSection = screen.getByRole('region', { name: 'Categorias de Despesa' })
    expect(within(expenseSection).getByText('Alimentação')).toBeInTheDocument()
    expect(within(expenseSection).getByText('Supermercado')).toBeInTheDocument()
    expect(within(expenseSection).getByText('Restaurante')).toBeInTheDocument()
    expect(within(expenseSection).getByText('Moradia')).toBeInTheDocument()
  })

  it('renders edit link for each category', () => {
    render(<CategoriesList categories={categories} />)

    expect(screen.getByRole('link', { name: 'Editar categoria Salário' })).toHaveAttribute(
      'href',
      '/dashboard/categories/1',
    )
    expect(screen.getByRole('link', { name: 'Editar categoria Supermercado' })).toHaveAttribute(
      'href',
      '/dashboard/categories/4',
    )
  })

  it('shows Inativa badge for inactive categories', () => {
    render(<CategoriesList categories={categories} />)

    const expenseSection = screen.getByRole('region', { name: 'Categorias de Despesa' })
    expect(within(expenseSection).getByText('Inativa')).toBeInTheDocument()
  })
})
