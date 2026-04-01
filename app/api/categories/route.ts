import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import {
  createCategory,
  listCategoriesByUser,
} from '@/modules/categories/service'
import { categoryCreateSchema } from '@/modules/categories'

export async function GET() {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const categories = await listCategoriesByUser(user.id)

  return NextResponse.json(categories)
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = categoryCreateSchema.parse(await request.json())
  const category = await createCategory(user.id, payload)

  return NextResponse.json(category, { status: 201 })
}
