// API pour générer le récap quotidien avec IA
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { genererRecapAvecIA } from '@/lib/ai-recap'
import { apiSuccess, apiError, apiServerError, normalizeDate } from '@/lib/api-helpers'

/**
 * POST /api/admin/recaps/generate
 * Body: { date?: string } (optionnel, par défaut = hier)
 * Génère le récap quotidien avec résumé IA
 *
 * Cette route est conçue pour être appelée par un cron job tous les matins à 6h
 * Elle peut aussi être appelée manuellement avec une date spécifique
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { date: dateParam } = body

    // Date cible : hier par défaut (car on génère le lendemain matin)
    let targetDate: Date
    if (dateParam) {
      targetDate = normalizeDate(dateParam)
    } else {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      targetDate = normalizeDate(yesterday)
    }

    console.log(`[Génération récap] Date: ${targetDate.toISOString()}`)

    // Récupérer tous les appels de cette date avec observations
    const appels = await prisma.appel.findMany({
      where: {
        date: targetDate,
        AND: [
          { observation: { not: null } },
          { observation: { not: '' } },
        ],
      },
      include: {
        eleve: {
          select: {
            nom: true,
            prenom: true,
            sexe: true,
          },
        },
      },
      orderBy: [
        { niveau: 'asc' },
        { eleve: { nom: 'asc' } },
      ],
    })

    if (appels.length === 0) {
      console.log('[Génération récap] Aucune observation trouvée')
      return apiError('Aucune observation trouvée pour cette date', 404)
    }

    console.log(`[Génération récap] ${appels.length} observation(s) trouvée(s)`)

    // Filtrer et formater les observations pour l'IA
    const observationsFormatted = appels
      .filter((a) => a.observation && a.observation.trim() !== '')
      .map((a) => ({
        niveau: a.niveau,
        eleve: a.eleve,
        statut: a.statut,
        observation: a.observation!,
      }))

    // Générer le contenu avec IA
    const contenu = await genererRecapAvecIA(observationsFormatted, targetDate)

    // Vérifier si un récap existe déjà pour cette date
    const existingRecap = await prisma.recap.findUnique({
      where: { date: targetDate },
    })

    let recap
    if (existingRecap) {
      // Mettre à jour le récap existant
      recap = await prisma.recap.update({
        where: { id: existingRecap.id },
        data: { contenu },
      })
      console.log('[Génération récap] Récap mis à jour')
    } else {
      // Créer un nouveau récap
      recap = await prisma.recap.create({
        data: {
          date: targetDate,
          contenu,
        },
      })
      console.log('[Génération récap] Nouveau récap créé')
    }

    return apiSuccess({
      recap: {
        id: recap.id,
        date: recap.date,
        createdAt: recap.createdAt,
      },
      observationsCount: appels.length,
    })
  } catch (error) {
    // FIX BUG ERROR LEAK : ne jamais exposer error.message au client
    return apiServerError('[Génération récap] Erreur', error)
  }
}
