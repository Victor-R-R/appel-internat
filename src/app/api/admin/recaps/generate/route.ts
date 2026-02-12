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

    // Récupérer toutes les observations de groupe pour cette date (même vides pour afficher RAS)
    const observationsGroupes = await prisma.observationGroupe.findMany({
      where: {
        date: targetDate,
      },
      orderBy: [
        { niveau: 'asc' },
        { sexeGroupe: 'asc' },
      ],
    })

    // Récupérer les absences pour cette date, groupées par niveau et sexe
    const absences = await prisma.appel.findMany({
      where: {
        date: targetDate,
        statut: 'absent',
      },
      include: {
        eleve: true,
      },
      orderBy: [
        { niveau: 'asc' },
        { eleve: { sexe: 'asc' } },
        { eleve: { nom: 'asc' } },
      ],
    })

    if (observationsGroupes.length === 0 && absences.length === 0) {
      console.log('[Génération récap] Aucune donnée trouvée')
      return apiError('Aucune donnée trouvée pour cette date', 404)
    }

    console.log(`[Génération récap] ${observationsGroupes.length} groupe(s) trouvé(s), ${absences.length} absence(s)`)

    // Formater les observations pour l'IA (inclure "RAS" si vide)
    const observationsFormatted = observationsGroupes.map((obs) => ({
      niveau: obs.niveau,
      sexeGroupe: obs.sexeGroupe,
      observation: obs.observation && obs.observation.trim() !== '' ? obs.observation : 'RAS',
    }))

    // Grouper les absences par niveau et sexe
    const absencesParGroupe: Record<string, Array<{ nom: string; prenom: string }>> = {}
    absences.forEach((appel) => {
      const key = `${appel.niveau}-${appel.eleve.sexe}`
      if (!absencesParGroupe[key]) {
        absencesParGroupe[key] = []
      }
      absencesParGroupe[key].push({
        nom: appel.eleve.nom,
        prenom: appel.eleve.prenom,
      })
    })

    // Générer le contenu avec IA
    const contenu = await genererRecapAvecIA(observationsFormatted, absencesParGroupe, targetDate)

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
      observationsCount: observationsGroupes.length,
    })
  } catch (error) {
    // FIX BUG ERROR LEAK : ne jamais exposer error.message au client
    return apiServerError('[Génération récap] Erreur', error)
  }
}
