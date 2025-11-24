// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/', '/login', '/register']
const PUBLIC_API_ROUTES = ['/api/auth/login', '/api/auth/logout', '/api/auth/me']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isPublicPage = PUBLIC_ROUTES.includes(pathname)
  const isPublicApi = PUBLIC_API_ROUTES.includes(pathname)

  // Só protege dashboard e API privadas
  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isApiRoute = pathname.startsWith('/api')

  if (!isDashboardRoute && !isApiRoute) {
    return NextResponse.next()
  }

  if (isApiRoute && isPublicApi) {
    return NextResponse.next()
  }

  const token = req.cookies.get('auth_token')?.value

  if (!token) {
    // Se for página, redireciona pro login
    if (isDashboardRoute) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Se for API privada, responde 401
    if (isApiRoute && !isPublicApi) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard', '/dashboard/(.*)', '/api/(.*)'],
}
