// app/api/auth/me/route.ts
import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

export async function GET() {
  const user = await getUserFromRequest()
  if (!user) {
    return NextResponse.json(
      { user: null },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  return NextResponse.json(
    {
      user: { id: user.id, name: user.name, email: user.email },
    },
    {
      headers: { 'Cache-Control': 'no-store' },
    },
  )
}
