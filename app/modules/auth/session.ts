import jwt from "jsonwebtoken"
import type { AuthTokenPayload } from "./contracts"

const jwtSecret = process.env.JWT_SECRET || "dev-secret"

export function signAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: "7d" })
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, jwtSecret) as AuthTokenPayload
}
