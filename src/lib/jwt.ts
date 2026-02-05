/**
 * Utilitaires JWT pour authentification sécurisée
 * Utilise jose (moderne, Edge Runtime compatible)
 */

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-dev-only'
const secret = new TextEncoder().encode(JWT_SECRET)

export type JWTPayload = {
  userId: string
  email: string
  role: string
  niveau?: string | null
  sexeGroupe?: string | null
}

/**
 * Crée un token JWT avec les données utilisateur
 * Expire après 7 jours
 */
export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

/**
 * Vérifie et décode un token JWT
 * Retourne null si invalide ou expiré
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Définit le cookie JWT dans la réponse HTTP
 * HttpOnly + Secure + SameSite pour sécurité maximale
 */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    path: '/',
  })
}

/**
 * Supprime le cookie d'authentification
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}

/**
 * Récupère le token depuis les cookies
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get('auth-token')
  return cookie?.value || null
}

/**
 * Récupère la session utilisateur depuis le cookie JWT
 * Retourne null si non authentifié ou token invalide
 */
export async function getSession(): Promise<JWTPayload | null> {
  const token = await getAuthToken()
  if (!token) return null

  return verifyToken(token)
}

/**
 * Vérifie si l'utilisateur est authentifié
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}

/**
 * Vérifie si l'utilisateur est superadmin
 */
export async function isSuperAdmin(): Promise<boolean> {
  const session = await getSession()
  return session?.role === 'superadmin'
}

/**
 * Vérifie si l'utilisateur a un accès admin complet
 * (CPE, Manager ou Superadmin peuvent voir tous les historiques/stats/récaps)
 */
export async function hasAdminAccess(): Promise<boolean> {
  const session = await getSession()
  return ['cpe', 'manager', 'superadmin'].includes(session?.role || '')
}
