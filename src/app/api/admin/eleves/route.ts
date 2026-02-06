// API CRUD pour les élèves (superadmin uniquement)
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { eleveSchema, validateRequest } from '@/lib/validation'
import { apiSuccess, apiError, apiServerError } from '@/lib/api-helpers'

/**
 * GET /api/admin/eleves
 * Liste tous les élèves
 */
export async function GET() {
  try {
    const eleves = await prisma.eleve.findMany({
      orderBy: [
        { niveau: 'asc' },
        { nom: 'asc' },
        { prenom: 'asc' },
      ],
    })

    return apiSuccess({ eleves })
  } catch (error) {
    return apiServerError('Erreur liste élèves', error)
  }
}

/**
 * POST /api/admin/eleves
 * Créer un nouvel élève
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation avec Zod
    const validation = validateRequest(eleveSchema, body)
    if (!validation.success) {
      return apiError(validation.error, 400)
    }

    const { nom, prenom, niveau, sexe } = validation.data

    // Créer l'élève
    const eleve = await prisma.eleve.create({
      data: {
        nom,
        prenom,
        niveau,
        sexe,
        actif: true,
      },
    })

    return apiSuccess({ eleve })
  } catch (error) {
    return apiServerError('Erreur création élève', error)
  }
}
