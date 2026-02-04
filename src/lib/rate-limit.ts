/**
 * Rate limiting simple en mémoire pour protéger contre le brute force
 * Pour production, utiliser Redis (Upstash) pour un rate limiting distribué
 */

type RateLimitEntry = {
  count: number
  resetAt: number
}

// Map en mémoire : IP -> { count, resetAt }
const store = new Map<string, RateLimitEntry>()

// Nettoyage automatique toutes les 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(ip)
    }
  }
}, 5 * 60 * 1000) // 5 minutes

export type RateLimitConfig = {
  maxAttempts: number // Nombre max de tentatives
  windowMs: number // Fenêtre de temps en millisecondes
}

export type RateLimitResult = {
  success: boolean
  remaining: number
  resetAt: number
}

/**
 * Vérifie et incrémente le compteur de rate limiting
 * @param identifier Identifiant unique (IP, user ID, etc.)
 * @param config Configuration du rate limit
 * @returns Résultat avec success, remaining attempts, et resetAt
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(identifier)

  // Pas d'entrée ou expirée → créer nouvelle
  if (!entry || entry.resetAt < now) {
    const resetAt = now + config.windowMs
    store.set(identifier, { count: 1, resetAt })
    return {
      success: true,
      remaining: config.maxAttempts - 1,
      resetAt,
    }
  }

  // Limite atteinte
  if (entry.count >= config.maxAttempts) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
    }
  }

  // Incrémenter
  entry.count++
  store.set(identifier, entry)

  return {
    success: true,
    remaining: config.maxAttempts - entry.count,
    resetAt: entry.resetAt,
  }
}

/**
 * Réinitialise le rate limit pour un identifiant
 * (utile après succès de connexion)
 */
export function resetRateLimit(identifier: string): void {
  store.delete(identifier)
}

/**
 * Helper pour extraire l'IP du client depuis NextRequest
 */
export function getClientIp(request: Request): string {
  // En production, l'IP peut être dans x-forwarded-for (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback (ne devrait pas arriver en production)
  return 'unknown'
}
