// API pour sauvegarder et récupérer les appels
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { appelCompletSchema, validateRequest } from '@/lib/validation'
import { apiSuccess, apiError, apiServerError, normalizeDate } from '@/lib/api-helpers'
import { findByNiveauAndDate, replaceForNiveauAndDate, findObservationGroupe, upsertObservationGroupe } from '@/lib/repositories/appel'
import type { Niveau, Sexe } from '@/lib/constants'

/**
 * GET /api/appel?niveau=6eme&date=2024-01-15&sexeGroupe=M
 * Récupère l'appel du jour pour un niveau et un groupe
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const niveau = searchParams.get('niveau')
    const sexeGroupe = searchParams.get('sexeGroupe')
    const dateParam = searchParams.get('date')

    if (!niveau) {
      return apiError('Niveau requis', 400)
    }

    if (!sexeGroupe) {
      return apiError('Sexe du groupe requis', 400)
    }

    // Date du jour ou date fournie
    const date = normalizeDate(dateParam || undefined)

    // Récupérer les appels existants pour ce niveau et cette date
    const appels = await findByNiveauAndDate(niveau as Niveau, date)

    // Récupérer l'observation de groupe
    const observationGroupe = await findObservationGroupe(
      date,
      niveau as Niveau,
      sexeGroupe as Sexe
    )

    // Si aucun appel trouvé
    if (appels.length === 0) {
      return apiSuccess({
        appels: [],
        exists: false,
        observation: observationGroupe?.observation || '',
      })
    }

    // Formater les données pour le frontend
    const formattedAppels = appels.map((appel) => ({
      eleveId: appel.eleveId,
      statut: appel.statut,
      eleve: appel.eleve,
    }))

    return apiSuccess({
      appels: formattedAppels,
      exists: true,
      aed: appels[0].aed, // Info de l'AED qui a fait l'appel
      date: appels[0].date,
      observation: observationGroupe?.observation || '',
    })
  } catch (error) {
    return apiServerError('Erreur récupération appel', error)
  }
}

/**
 * POST /api/appel
 * Body: { aedId: string, niveau: string, sexeGroupe: string, observation?: string, appels: AppelData[] }
 * Sauvegarde l'appel de toute une classe et l'observation du groupe
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation avec Zod
    const validation = validateRequest(appelCompletSchema, body)
    if (!validation.success) {
      return apiError(validation.error, 400)
    }

    const { aedId, niveau, sexeGroupe, observation, appels } = validation.data

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
      }))
    )

    // Sauvegarder l'observation de groupe si elle existe et n'est pas vide
    if (observation && observation.trim() !== '') {
      await upsertObservationGroupe({
        date: today,
        niveau: niveau as Niveau,
        sexeGroupe: sexeGroupe as Sexe,
        observation: observation.trim(),
        aedId,
      })
    }

    return apiSuccess({
      count: result.count, // Nombre d'appels créés
    })
  } catch (error) {
    return apiServerError('Erreur sauvegarde appel', error)
  }
}
