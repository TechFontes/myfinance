import { beforeEach, describe, expect, it, vi } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  category: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findFirst: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

import {
  createCategory,
  deleteCategoryById,
  listCategoriesByUser,
  updateCategoryById,
} from '@/modules/categories/service'

describe('categories service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists categories for a user ordered by name', async () => {
    prismaMock.category.findMany.mockResolvedValue([{ id: 1, name: 'Moradia' }])

    const result = await listCategoriesByUser('user-1')

    expect(prismaMock.category.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { name: 'asc' },
    })
    expect(result).toEqual([{ id: 1, name: 'Moradia' }])
  })

  it('creates a category linked to the user', async () => {
    prismaMock.category.findFirst.mockResolvedValue({
      id: 1,
      userId: 'user-1',
      type: 'EXPENSE',
      active: true,
    })
    prismaMock.category.create.mockResolvedValue({
      id: 2,
      userId: 'user-1',
      name: 'Transporte',
      type: 'EXPENSE',
      parentId: null,
      active: true,
    })

    const result = await createCategory('user-1', {
      name: 'Transporte',
      type: 'EXPENSE',
    })

    expect(prismaMock.category.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        name: 'Transporte',
        type: 'EXPENSE',
        parentId: null,
      },
    })
    expect(result.userId).toBe('user-1')
  })

  it('rejects parent categories with incompatible type', async () => {
    prismaMock.category.findFirst.mockResolvedValue({
      id: 1,
      userId: 'user-1',
      type: 'INCOME',
      active: true,
    })

    await expect(
      createCategory('user-1', {
        name: 'Subcategoria',
        type: 'EXPENSE',
        parentId: 1,
      }),
    ).rejects.toMatchObject({
      code: 'CATEGORY_PARENT_TYPE_MISMATCH',
    })
  })

  it('updates a category and supports inactivation', async () => {
    prismaMock.category.update.mockResolvedValue({
      id: 3,
      active: false,
    })

    const result = await updateCategoryById('user-1', 3, {
      name: 'Lazer',
      active: false,
    })

    expect(prismaMock.category.update).toHaveBeenCalledWith({
      where: { id: 3, userId: 'user-1' },
      data: {
        name: 'Lazer',
        active: false,
      },
    })
    expect(result.active).toBe(false)
  })

  it('blocks deletion when category has transactional history', async () => {
    prismaMock.category.findFirst.mockResolvedValue({
      id: 4,
      transactions: [{ id: 10 }],
    })

    await expect(deleteCategoryById('user-1', 4)).rejects.toMatchObject({
      code: 'CATEGORY_HAS_HISTORY',
    })

    expect(prismaMock.category.delete).not.toHaveBeenCalled()
  })

  it('deletes category when it has no history', async () => {
    prismaMock.category.findFirst.mockResolvedValue({
      id: 5,
      transactions: [],
      children: [],
    })
    prismaMock.category.delete.mockResolvedValue({ id: 5 })

    const result = await deleteCategoryById('user-1', 5)

    expect(prismaMock.category.delete).toHaveBeenCalledWith({
      where: { id: 5, userId: 'user-1' },
    })
    expect(result.id).toBe(5)
  })
})
