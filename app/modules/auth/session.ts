import jwt from "jsonwebtoken"
import type { AuthTokenPayload } from "./contracts"

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production')
    }
    return 'dev-secret-not-for-production'
  }
  return secret
}

const jwtSecret = getJwtSecret()

export function signAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: "7d" })
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, jwtSecret) as AuthTokenPayload
}
