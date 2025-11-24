// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(_req: NextRequest) {
  const user = await getUserFromRequest()
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 })
  }

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email },
  })
}
