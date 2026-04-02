// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const categoriesMock = vi.hoisted(() => ({
  listCategoriesByUser: vi.fn(),
}))

vi.mock('@/components/categories/CategoryCreateForm', () => ({
  CategoryCreateForm: vi.fn(
    ({
      mode,
      category,
      categories,
    }: {
      mode: 'create' | 'edit'
      category: { id: number; name: string }
      categories: Array<{ id: number; name: string }>
    }) => (
      <div data-testid="category-edit-form">
        <span>mode:{mode}</span>
        <span>category:{category.name}</span>
        <span>options:{categories.map((item) => item.name).join(',')}</span>
      </div>
    ),
  ),
}))
vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/categories/service', () => categoriesMock)

describe('category edit page', () => {
  it('loads the current category and renders the shared form in edit mode', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    categoriesMock.listCategoriesByUser.mockResolvedValue([
      { id: 1, name: 'Moradia', type: 'EXPENSE', parentId: null, active: true },
      { id: 2, name: 'Aluguel', type: 'EXPENSE', parentId: 1, active: true },
    ])

    const { default: CategoryEditPage } = await import('@/dashboard/categories/[categoryId]/page')
    render(await CategoryEditPage({ params: { categoryId: '2' } }))

    expect(screen.getByRole('heading', { name: 'Editar categoria' })).toBeInTheDocument()
    expect(screen.getByTestId('category-edit-form')).toHaveTextContent('mode:edit')
    expect(screen.getByTestId('category-edit-form')).toHaveTextContent('category:Aluguel')
    expect(screen.getByTestId('category-edit-form')).toHaveTextContent('options:Moradia,Aluguel')
  }, 10000)

  it('awaits async route params and loads the matching category record under runtime semantics', async () => {
    cleanup()
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    categoriesMock.listCategoriesByUser.mockResolvedValue([
      { id: 5, name: 'Moradia', type: 'EXPENSE', parentId: null, active: true },
      { id: 6, name: 'Aluguel', type: 'EXPENSE', parentId: 5, active: true },
    ])

    const { default: CategoryEditPage } = await import('@/dashboard/categories/[categoryId]/page')
    render(await CategoryEditPage({ params: Promise.resolve({ categoryId: '5' }) }))

    expect(screen.getByRole('heading', { name: 'Editar categoria' })).toBeInTheDocument()
    expect(screen.getByTestId('category-edit-form')).toBeInTheDocument()
    expect(screen.getByTestId('category-edit-form')).toHaveTextContent('mode:edit')
    expect(screen.getByTestId('category-edit-form')).toHaveTextContent('category:Moradia')
    expect(screen.getByTestId('category-edit-form')).toHaveTextContent('options:Moradia,Aluguel')
  }, 10000)
})
