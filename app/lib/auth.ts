// lib/auth.ts
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { findUserById } from '@/services/userService'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret' // trocar em prod
const TOKEN_COOKIE_NAME = 'auth_token'

type JwtPayload = {
  sub: string // user id
  email: string
}

export function signAuthToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export async function getUserFromRequest() {
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    const user = await findUserById(decoded.sub)
    return user
  } catch (error) {
    return null
  }
}
