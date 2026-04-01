import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import {
  deleteCategoryById,
  updateCategoryById,
} from '@/modules/categories/service'
import { categoryUpdateSchema } from '@/modules/categories'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { categoryId: categoryIdParam } = await params
  const categoryId = Number(categoryIdParam)
  const payload = categoryUpdateSchema.parse(await request.json())
  const category = await updateCategoryById(user.id, categoryId, payload)

  if (!category) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(category)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { categoryId: categoryIdParam } = await params
  const categoryId = Number(categoryIdParam)
  const category = await deleteCategoryById(user.id, categoryId)

  if (!category) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(category)
}
