// API pour récupérer l'historique des appels
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiServerError, getDateRange } from '@/lib/api-helpers'
import { APPEL_INCLUDE_FULL } from '@/lib/prisma-selects'

/**
 * GET /api/admin/appels?date=2024-01-15&niveau=6eme&sexe=F
 * Récupère l'historique des appels avec filtres
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    const niveauParam = searchParams.get('niveau')
    const sexeParam = searchParams.get('sexe')

    // Construire les filtres
    const where: any = {}

    // Filtre par date si fourni (plage sur toute la journée) - FIX BUG TIMEZONE
    if (dateParam) {
      const { start, end } = getDateRange(dateParam)

      where.date = {
        gte: start,
        lte: end,
      }
    }

    // Filtre par niveau si fourni
    if (niveauParam && niveauParam !== 'tous') {
      where.niveau = niveauParam
    }

    // Filtre par sexe si fourni (via la relation eleve)
    if (sexeParam && sexeParam !== 'tous') {
      where.eleve = {
        sexe: sexeParam,
      }
    }

    // Récupérer les appels avec les informations de l'élève et de l'AED
    const appels = await prisma.appel.findMany({
      where,
      include: APPEL_INCLUDE_FULL,
      orderBy: [
        { niveau: 'asc' },
        { date: 'desc' },
        { eleve: { nom: 'asc' } },
      ],
    })

    // Récupérer les observations de groupe pour les dates concernées
    const dates = [...new Set(appels.map(a => a.date.toISOString().split('T')[0]))]
    const observationsGroupes = await prisma.observationGroupe.findMany({
      where: {
        date: {
          in: dates.map(d => new Date(d)),
        },
      },
    })

    // Créer un index des observations par clé
    const obsIndex = observationsGroupes.reduce((acc, obs) => {
      const key = `${obs.niveau}_${obs.date.toISOString().split('T')[0]}_${obs.sexeGroupe}`
      acc[key] = obs.observation
      return acc
    }, {} as Record<string, string | null>)

    // Grouper les appels par niveau, date ET sexe
    const grouped = appels.reduce((acc, appel) => {
      const key = `${appel.niveau}_${appel.date.toISOString().split('T')[0]}_${appel.eleve.sexe}`
      if (!acc[key]) {
        acc[key] = {
          niveau: appel.niveau,
          date: appel.date,
          sexeGroupe: appel.eleve.sexe,
          appels: [],
          aed: appel.aed, // Premier AED trouvé pour ce groupe
          observation: obsIndex[key] || null, // Observation du groupe
        }
      }
      acc[key].appels.push({
        id: appel.id,
        statut: appel.statut,
        eleve: appel.eleve,
      })
      return acc
    }, {} as Record<string, any>)

    return apiSuccess({
      groups: Object.values(grouped),
      total: appels.length,
    })
  } catch (error) {
    return apiServerError('Erreur récupération appels', error)
  }
}
