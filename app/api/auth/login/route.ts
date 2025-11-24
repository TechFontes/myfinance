// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { signAuthToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { findUserByEmail } from '@/services/userService'

const TOKEN_COOKIE_NAME = 'auth_token'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  const user = await findUserByEmail(email)
  if (!user || !user.password) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
  }

  const isValid = await bcrypt.compare(password, user.password)
  
  if (!isValid) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
  }


  const token = signAuthToken({ sub: user.id, email: user.email })

  const res = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email },
  })

  res.cookies.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  })

  return res
}
