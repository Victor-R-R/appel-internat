/**
 * API Route pour déconnexion
 * POST /api/auth/logout
 */

import { clearAuthCookie } from '@/lib/jwt'
import { apiSuccess, apiServerError } from '@/lib/api-helpers'

export async function POST() {
  try {
    // Supprimer le cookie d'authentification
    await clearAuthCookie()

    return apiSuccess({ message: 'Déconnexion réussie' })
  } catch (error) {
    return apiServerError('Erreur logout', error)
  }
}
