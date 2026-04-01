import { NextRequest, NextResponse } from 'next/server'
import { authTokenCookieName, verifyAuthToken } from '@/modules/auth'

const PUBLIC_ROUTES = ['/', '/login', '/register']
const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/auth/register',
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isPublicPage = PUBLIC_ROUTES.includes(pathname)
  const isPublicApi = PUBLIC_API_ROUTES.includes(pathname)
  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isAdminRoute = pathname.startsWith('/admin')
  const isApiRoute = pathname.startsWith('/api')

  if (!isDashboardRoute && !isAdminRoute && !isApiRoute && !isPublicPage) {
    return NextResponse.next()
  }

  if (isPublicPage || (isApiRoute && isPublicApi)) {
    return NextResponse.next()
  }

  const token = req.cookies.get(authTokenCookieName)?.value

  if (!token) {
    if (isDashboardRoute || isAdminRoute) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (isApiRoute && !isPublicApi) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  if (token && isAdminRoute) {
    try {
      const payload = verifyAuthToken(token)
      if (payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/:path*'],
}
