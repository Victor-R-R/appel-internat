// API pour sauvegarder et récupérer les appels
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { appelCompletSchema, validateRequest } from '@/lib/validation'
import { apiSuccess, apiError, apiServerError, normalizeDate } from '@/lib/api-helpers'
import { findByNiveauAndDate, replaceForNiveauAndDate } from '@/lib/repositories/appel'
import type { Niveau } from '@/lib/constants'

/**
 * GET /api/appel?niveau=6eme&date=2024-01-15
 * Récupère l'appel du jour pour un niveau
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const niveau = searchParams.get('niveau')
    const dateParam = searchParams.get('date')

    if (!niveau) {
      return apiError('Niveau requis', 400)
    }

    // Date du jour ou date fournie
    const date = normalizeDate(dateParam || undefined)

    // Récupérer les appels existants pour ce niveau et cette date
    const appels = await findByNiveauAndDate(niveau as Niveau, date)

    // Si aucun appel trouvé
    if (appels.length === 0) {
      return apiSuccess({
        appels: [],
        exists: false,
      })
    }

    // Formater les données pour le frontend
    const formattedAppels = appels.map((appel) => ({
      eleveId: appel.eleveId,
      statut: appel.statut,
      observation: appel.observation || '',
      eleve: appel.eleve,
    }))

    return apiSuccess({
      appels: formattedAppels,
      exists: true,
      aed: appels[0].aed, // Info de l'AED qui a fait l'appel
      date: appels[0].date,
    })
  } catch (error) {
    return apiServerError('Erreur récupération appel', error)
  }
}

/**
 * POST /api/appel
 * Body: { aedId: string, niveau: string, appels: AppelData[] }
 * Sauvegarde l'appel de toute une classe
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation avec Zod
    const validation = validateRequest(appelCompletSchema, body)
    if (!validation.success) {
      return apiError(validation.error, 400)
    }

    const { aedId, niveau, appels } = validation.data

    // Date du jour en UTC (évite les problèmes de timezone)
    const today = normalizeDate()

    // Remplacer les appels pour ce niveau et cette date (transaction atomique)
    const result = await replaceForNiveauAndDate(
      niveau as Niveau,
      today,
      appels.map((appel) => ({
        eleveId: appel.eleveId,
        aedId,
        statut: appel.statut,
        observation: appel.observation || null,
      }))
    )

    return apiSuccess({
      count: result.count, // Nombre d'appels créés
    })
  } catch (error) {
    return apiServerError('Erreur sauvegarde appel', error)
  }
}
