import { auth } from "./auth"
import { NextResponse } from "next/server"

export async function middleware(request) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // Rotas públicas: /login, /api/auth/*, static files
  const publicPaths = ['/login']
  const isPublicPath = publicPaths.some(path => pathname === path)
  const isAuthApi = pathname.startsWith('/api/auth')
  const isStaticFile = pathname.startsWith('/_next') || pathname.startsWith('/icons') || pathname === '/manifest.json' || pathname === '/favicon.ico'

  // Se for rota pública e usuário está logado: redireciona para dashboard
  if ((isPublicPath || isAuthApi) && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Se não for rota pública/static e não tem sessão: redireciona para login
  if (!isPublicPath && !isAuthApi && !isStaticFile && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|icons|favicon.ico|manifest.json|login).*)'],
}
