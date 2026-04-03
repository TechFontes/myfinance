import { cookies } from 'next/headers'
import { findUserById } from '@/services/userService'
import {
  authTokenCookieName,
  signAuthToken as signModuleAuthToken,
  verifyAuthToken,
  type AuthTokenPayload,
} from '@/modules/auth'

export function signAuthToken(payload: AuthTokenPayload) {
  return signModuleAuthToken(payload)
}

export async function getUserFromRequest() {
  const cookieStore = await cookies()
  const token = cookieStore.get(authTokenCookieName)?.value
  if (!token) return null

  try {
    const decoded = verifyAuthToken(token)
    const user = await findUserById(decoded.sub)

    if (!user || user.blockedAt) {
      return null
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      return null
    }

    return user
  } catch {
    return null
  }
}
