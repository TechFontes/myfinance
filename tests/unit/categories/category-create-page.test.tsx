// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const categoriesMock = vi.hoisted(() => ({
  listCategoriesByUser: vi.fn(),
}))

vi.mock('@/components/categories/CategoryCreateForm', () => ({
  CategoryCreateForm: ({ categories }: { categories: Array<{ id: number; name: string }> }) => (
    <div data-testid="category-create-form">
      <span>{categories.map((category) => category.name).join(',')}</span>
    </div>
  ),
}))
vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/categories/service', () => categoriesMock)

describe('category create page', () => {
  it('renders the create form with human-friendly category hierarchy options', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    categoriesMock.listCategoriesByUser.mockResolvedValue([
      { id: 1, name: 'Moradia', type: 'EXPENSE', parentId: null, active: true },
      { id: 2, name: 'Transporte', type: 'EXPENSE', parentId: null, active: true },
    ])

    const { default: CategoryCreatePage } = await import('@/dashboard/categories/new/page')
    render(await CategoryCreatePage())

    expect(screen.getByRole('heading', { name: 'Nova categoria' })).toBeInTheDocument()
    expect(screen.getByTestId('category-create-form')).toHaveTextContent('Moradia')
    expect(screen.getByTestId('category-create-form')).toHaveTextContent('Transporte')
    expect(categoriesMock.listCategoriesByUser).toHaveBeenCalledWith('user-1')
  }, 10000)
})
