// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'

const TOKEN_COOKIE_NAME = 'auth_token'

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.set(TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return res
}
