// API pour récupérer les élèves d'un niveau
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, apiServerError } from '@/lib/api-helpers'

/**
 * GET /api/eleves?niveau=6eme&sexe=F
 * Retourne la liste des élèves actifs d'un niveau et d'un sexe
 */
export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de l'URL
    const searchParams = request.nextUrl.searchParams
    const niveau = searchParams.get('niveau')
    const sexe = searchParams.get('sexe')

    if (!niveau) {
      return apiError('Niveau requis')
    }

    if (!sexe) {
      return apiError('Sexe requis')
    }

    // Chercher les élèves actifs de ce niveau et de ce sexe
    const eleves = await prisma.eleve.findMany({
      where: {
        niveau,
        sexe,
        actif: true, // Seulement les élèves encore présents
      },
      orderBy: [
        { nom: 'asc' },     // Tri par nom
        { prenom: 'asc' },  // puis prénom
      ],
    })

    return apiSuccess({ eleves })
  } catch (error) {
    return apiServerError('Erreur récupération élèves', error)
  }
}
