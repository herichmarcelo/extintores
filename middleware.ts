import { NextResponse } from "next/server"

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // 1. REGRA DE OURO: Deixa a API do NextAuth em paz. Não redireciona!
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  const isPublicPath = pathname === '/login'

  // Procura o cookie de sessão (funciona local e na Vercel)
  const cookies = request.cookies.getAll()
  const hasSessionCookie = cookies.some(cookie => cookie.name.includes('session-token'))

  // 2. Se tá logado e tenta ir pro /login, joga pro dashboard
  if (isPublicPath && hasSessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 3. Se não tá logado e tenta ir pra uma rota protegida, chuta pro /login
  if (!isPublicPath && !hasSessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 4. Se passou por tudo, deixa seguir o fluxo normal
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|icons|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}