export const authTokenCookieName = "auth_token"

export const authRoles = ["USER", "ADMIN"] as const

export type AuthRole = (typeof authRoles)[number]

export type AuthTokenPayload = {
  sub: string
  email: string
  role: AuthRole
  tokenVersion: number
}
