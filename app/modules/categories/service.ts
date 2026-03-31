import { prisma } from '@/lib/prisma'
import type { Prisma, Category } from '@prisma/client'

type CategoryInput = {
  name: string
  type: 'INCOME' | 'EXPENSE'
  parentId?: number
}

type CategoryUpdateInput = Partial<CategoryInput> & {
  active?: boolean
}

type CategoryError = Error & { code: string }

function createCategoryError(code: string, message: string): CategoryError {
  const error = new Error(message) as CategoryError
  error.code = code
  return error
}

async function assertParentCategory(
  userId: string,
  parentId: number,
  type: CategoryInput['type'],
) {
  const parent = await prisma.category.findFirst({
    where: { id: parentId, userId },
  })

  if (!parent) {
    throw createCategoryError('CATEGORY_PARENT_NOT_FOUND', 'Parent category not found')
  }

  if (parent.type !== type) {
    throw createCategoryError(
      'CATEGORY_PARENT_TYPE_MISMATCH',
      'Parent category type must match the child type',
    )
  }

  if (parent.active === false) {
    throw createCategoryError('CATEGORY_PARENT_INACTIVE', 'Parent category is inactive')
  }
}

export async function listCategoriesByUser(userId: string): Promise<Category[]> {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  })
}

export async function createCategory(
  userId: string,
  data: CategoryInput,
): Promise<Category> {
  if (data.parentId) {
    await assertParentCategory(userId, data.parentId, data.type)
  }

  return prisma.category.create({
    data: {
      userId,
      name: data.name,
      type: data.type,
      parentId: data.parentId ?? null,
    },
  })
}

export async function updateCategoryById(
  userId: string,
  categoryId: number,
  data: CategoryUpdateInput,
): Promise<Category | null> {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  })

  if (!category) {
    return null
  }

  if (data.parentId) {
    const nextType = data.type ?? category.type

    await assertParentCategory(userId, data.parentId, nextType)
  }

  const updateData: Prisma.CategoryUpdateInput = {}

  if (data.name !== undefined) {
    updateData.name = data.name
  }

  if (data.type !== undefined) {
    updateData.type = data.type
  }

  if (data.parentId !== undefined) {
    updateData.parentId = data.parentId
  }

  if (data.active !== undefined) {
    updateData.active = data.active
  }

  return prisma.category.update({
    where: { id: categoryId, userId },
    data: updateData,
  })
}

export async function deleteCategoryById(
  userId: string,
  categoryId: number,
): Promise<Category | null> {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
    include: {
      transactions: true,
      children: true,
    },
  })

  if (!category) {
    return null
  }

  if (category.transactions.length > 0 || category.children.length > 0) {
    throw createCategoryError(
      'CATEGORY_HAS_HISTORY',
      'Category has history or children and cannot be deleted',
    )
  }

  return prisma.category.delete({
    where: { id: categoryId, userId },
  })
}

export { createCategoryError }
