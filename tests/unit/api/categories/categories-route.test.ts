import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMock = vi.hoisted(() => ({
  getUserFromRequest: vi.fn(),
}))

const categoriesMock = vi.hoisted(() => ({
  listCategoriesByUser: vi.fn(),
  createCategory: vi.fn(),
  updateCategoryById: vi.fn(),
  deleteCategoryById: vi.fn(),
}))

vi.mock('@/lib/auth', () => authMock)
vi.mock('@/modules/categories/service', () => categoriesMock)

import { GET, POST } from '@/api/categories/route'
import { PATCH, DELETE } from '@/api/categories/[categoryId]/route'

describe('categories api routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists categories for the authenticated user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    categoriesMock.listCategoriesByUser.mockResolvedValue([{ id: 1, name: 'Moradia' }])

    const response = await GET(new Request('http://localhost/api/categories') as never)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual([{ id: 1, name: 'Moradia' }])
  })

  it('creates a category for the authenticated user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    categoriesMock.createCategory.mockResolvedValue({ id: 10, name: 'Transporte' })

    const response = await POST(
      new Request('http://localhost/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name: 'Transporte', type: 'EXPENSE' }),
      }) as never,
    )
    const payload = await response.json()

    expect(response.status).toBe(201)
    expect(categoriesMock.createCategory).toHaveBeenCalledWith('user-1', {
      name: 'Transporte',
      type: 'EXPENSE',
    })
    expect(payload).toEqual({ id: 10, name: 'Transporte' })
  })

  it('updates a category for the authenticated user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    categoriesMock.updateCategoryById.mockResolvedValue({ id: 10, name: 'Lazer' })

    const response = await PATCH(
      new Request('http://localhost/api/categories/10', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Lazer' }),
      }) as never,
      { params: { categoryId: '10' } },
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(categoriesMock.updateCategoryById).toHaveBeenCalledWith('user-1', 10, {
      name: 'Lazer',
    })
    expect(payload).toEqual({ id: 10, name: 'Lazer' })
  })

  it('deletes a category for the authenticated user', async () => {
    authMock.getUserFromRequest.mockResolvedValue({ id: 'user-1' })
    categoriesMock.deleteCategoryById.mockResolvedValue({ id: 10 })

    const response = await DELETE(
      new Request('http://localhost/api/categories/10', { method: 'DELETE' }) as never,
      { params: { categoryId: '10' } },
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(categoriesMock.deleteCategoryById).toHaveBeenCalledWith('user-1', 10)
    expect(payload).toEqual({ id: 10 })
  })
})
