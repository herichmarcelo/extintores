import { NextResponse } from "next/server"

export async function middleware(request) {
  const { pathname } = request.nextUrl

  const isPublicPath = pathname === '/login'
  const isAuthApi = pathname.startsWith('/api/auth')

  // A MÁGICA AQUI: Pega todos os cookies e procura qualquer um que tenha "session-token" no nome.
  // Isso resolve problema de cookie dividido (.0, .1) e prefixos malucos da Vercel.
  const cookies = request.cookies.getAll()
  const hasSessionCookie = cookies.some(cookie => cookie.name.includes('session-token'))

  if ((isPublicPath || isAuthApi) && hasSessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!isPublicPath && !isAuthApi && !hasSessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|icons|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}