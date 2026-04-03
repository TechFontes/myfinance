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

  const parsed = categoryCreateSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }
  const category = await createCategory(user.id, parsed.data)

  return NextResponse.json(category, { status: 201 })
}
