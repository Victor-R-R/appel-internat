/**
 * Middleware Next.js pour protéger les routes sensibles
 * S'exécute avant TOUTES les requêtes
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, type JWTPayload } from '@/lib/jwt'
import { ADMIN_ROLES } from '@/lib/constants'

/**
 * Vérifie le JWT depuis les cookies
 */
async function verifyAuth(request: NextRequest): Promise<JWTPayload | null> {
  const token = request.cookies.get('auth-token')?.value

  if (!token) return null

  return verifyToken(token)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Routes publiques (pas de vérification)
  const publicRoutes = ['/login', '/api/auth/login']
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Vérifier l'authentification
  const session = await verifyAuth(request)

  // Routes qui nécessitent juste d'être authentifié
  const authRoutes = ['/appel', '/api/appel', '/api/eleves']
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (!session) {
      // Rediriger vers login si pas authentifié
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          { success: false, error: 'Non authentifié' },
          { status: 401 }
        )
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  // Routes admin (nécessitent role cpe, manager ou superadmin)
  const adminRoutes = ['/admin', '/api/admin']
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!session) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          { success: false, error: 'Non authentifié' },
          { status: 401 }
        )
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (!ADMIN_ROLES.includes(session.role as any)) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          { success: false, error: 'Accès interdit - Droits admin requis (CPE/Manager/Superadmin)' },
          { status: 403 }
        )
      }
      // Rediriger les AED vers leur page d'appel
      return NextResponse.redirect(new URL('/appel', request.url))
    }

    return NextResponse.next()
  }

  // Page d'accueil : rediriger selon le rôle
  if (pathname === '/') {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (ADMIN_ROLES.includes(session.role as any)) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/appel', request.url))
  }

  return NextResponse.next()
}

// Configuration du matcher pour optimiser les performances
export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
