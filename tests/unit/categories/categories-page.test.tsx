// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const categoriesMock = vi.hoisted(() => ({
  listCategoriesByUser: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/categories/service', () => categoriesMock)

describe('categories page', () => {
  it('renders the category list with hierarchy and state labels', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    categoriesMock.listCategoriesByUser.mockResolvedValue([
      {
        id: 1,
        name: 'Moradia',
        type: 'EXPENSE',
        parentId: null,
        active: true,
      },
      {
        id: 2,
        name: 'Aluguel',
        type: 'EXPENSE',
        parentId: 1,
        active: false,
      },
    ])

    const { default: CategoriesPage } = await import('@/dashboard/categories/page')
    render(await CategoriesPage())

    expect(screen.getByRole('heading', { name: 'Categorias' })).toBeInTheDocument()
    expect(screen.getByText('Moradia')).toBeInTheDocument()
    expect(screen.getByText('Categoria principal')).toBeInTheDocument()
    expect(screen.getByText('Ativa')).toBeInTheDocument()
    expect(screen.getByText('Aluguel')).toBeInTheDocument()
    expect(screen.getByText('Subcategoria de Moradia')).toBeInTheDocument()
    expect(screen.getByText('Inativa')).toBeInTheDocument()
  }, 10000)
})
