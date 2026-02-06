/**
 * API Route pour récupérer l'utilisateur connecté depuis le JWT cookie
 * GET /api/auth/me
 */

import { getSession } from '@/lib/jwt'
import { apiSuccess, apiError, apiServerError } from '@/lib/api-helpers'

export async function GET() {
  try {
    // Récupérer la session depuis le cookie JWT
    const session = await getSession()

    if (!session) {
      return apiError('Non authentifié', 401)
    }

    // Retourner les infos utilisateur
    return apiSuccess({
      user: {
        id: session.userId,
        email: session.email,
        role: session.role,
        nom: session.nom,
        prenom: session.prenom,
        niveau: session.niveau,
        sexeGroupe: session.sexeGroupe,
      },
    })
  } catch (error) {
    return apiServerError('Erreur /api/auth/me', error)
  }
}
