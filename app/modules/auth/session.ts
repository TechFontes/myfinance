import jwt from "jsonwebtoken"
import type { AuthTokenPayload } from "./contracts"

let _jwtSecret: string | undefined

function getJwtSecret(): string {
  if (_jwtSecret) return _jwtSecret
  const secret = process.env.JWT_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production')
    }
    _jwtSecret = 'dev-secret-not-for-production'
    return _jwtSecret
  }
  _jwtSecret = secret
  return _jwtSecret
}

export function signAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" })
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as AuthTokenPayload
}
