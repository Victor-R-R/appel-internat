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

    // Récupérer tous les appels de cette date pour identifier les groupes actifs
    const appels = await prisma.appel.findMany({
      where: {
        date: targetDate,
      },
      include: {
        eleve: true,
      },
    })

    if (appels.length === 0) {
      console.log('[Génération récap] Aucun appel trouvé pour cette date')
      return apiError('Aucun appel trouvé pour cette date', 404)
    }

    // Identifier tous les groupes (niveau + sexe) qui ont fait l'appel
    const groupesActifs = new Set<string>()
    appels.forEach((appel) => {
      const key = `${appel.niveau}-${appel.eleve.sexe}`
      groupesActifs.add(key)
    })

    console.log(`[Génération récap] ${groupesActifs.size} groupe(s) actif(s) identifié(s)`)

    // Récupérer toutes les observations de groupe pour cette date
    const observationsGroupes = await prisma.observationGroupe.findMany({
      where: {
        date: targetDate,
      },
      orderBy: [
        { niveau: 'asc' },
        { sexeGroupe: 'asc' },
      ],
    })

    // Créer un map des observations existantes
    const observationsMap = new Map<string, string>()
    observationsGroupes.forEach((obs) => {
      const key = `${obs.niveau}-${obs.sexeGroupe}`
      observationsMap.set(key, obs.observation || 'RAS')
    })

    // Récupérer les absences pour cette date, groupées par niveau et sexe
    const absences = appels.filter((appel) => appel.statut === 'absent')

    console.log(`[Génération récap] ${observationsGroupes.length} observation(s) trouvée(s), ${absences.length} absence(s)`)

    // Formater les observations pour l'IA - inclure TOUS les groupes actifs
    const observationsFormatted: Array<{ niveau: string; sexeGroupe: string; observation: string }> = []

    groupesActifs.forEach((groupeKey) => {
      const [niveau, sexeGroupe] = groupeKey.split('-')
      const observation = observationsMap.get(groupeKey) || 'RAS'

      // Ajouter seulement si l'observation n'est pas vide OU s'il y a des absences
      const key = `${niveau}-${sexeGroupe}`
      const hasAbsences = absences.some((a) => a.niveau === niveau && a.eleve.sexe === sexeGroupe)

      // Toujours inclure le groupe (même si RAS)
      observationsFormatted.push({
        niveau,
        sexeGroupe,
        observation: observation.trim() !== '' ? observation : 'RAS',
      })
    })

    // Trier les observations par niveau
    const niveauxOrdre = ['6eme', '5eme', '4eme', '3eme', '2nde', '1ere', 'terminale']
    observationsFormatted.sort((a, b) => {
      const indexA = niveauxOrdre.indexOf(a.niveau)
      const indexB = niveauxOrdre.indexOf(b.niveau)
      if (indexA !== indexB) return indexA - indexB
      return a.sexeGroupe.localeCompare(b.sexeGroupe)
    })

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

    // Trier les absences par nom
    Object.keys(absencesParGroupe).forEach((key) => {
      absencesParGroupe[key].sort((a, b) => a.nom.localeCompare(b.nom))
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
