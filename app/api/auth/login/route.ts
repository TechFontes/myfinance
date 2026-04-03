import { NextRequest, NextResponse } from 'next/server'
import { signAuthToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { findUserByEmail } from '@/services/userService'
import { loginInputSchema } from '@/modules/auth'

const TOKEN_COOKIE_NAME = 'auth_token'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const parsed = loginInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid credentials format' }, { status: 400 })
  }

  const { email, password } = parsed.data

  const user = await findUserByEmail(email)
  if (!user || !user.password || user.blockedAt) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
  }

  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
  }

  const token = signAuthToken({ sub: user.id, email: user.email, role: user.role, tokenVersion: user.tokenVersion })

  const res = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  })

  res.cookies.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return res
}
