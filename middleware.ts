import { NextResponse } from "next/server"
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas públicas: /login, /api/auth/*, static files
  const publicPaths = ['/login']
  const isPublicPath = publicPaths.some(path => pathname === path)
  const isAuthApi = pathname.startsWith('/api/auth')
  const isStaticFile = pathname.startsWith('/_next') || pathname.startsWith('/icons') || pathname === '/manifest.json' || pathname === '/favicon.ico'

  // Verifica se o cookie de sessão existe
  const hasSessionCookie = request.cookies.has('next-auth.session-token') || 
                          request.cookies.has('__Secure-next-auth.session-token')

  // Se for rota pública e tem sessão: redireciona para dashboard
  if ((isPublicPath || isAuthApi) && hasSessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Se não for rota pública/static e NÃO tem sessão: redireciona para login
  if (!isPublicPath && !isAuthApi && !isStaticFile && !hasSessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|icons|favicon.ico|manifest.json|login).*)'],
}
