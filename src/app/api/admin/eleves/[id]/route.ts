// API pour modifier/supprimer un élève spécifique
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, apiServerError } from '@/lib/api-helpers'

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/admin/eleves/[id]
 * Modifier un élève (ou archiver/réactiver)
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    // Vérifier que l'élève existe
    const existing = await prisma.eleve.findUnique({
      where: { id },
    })

    if (!existing) {
      return apiError('Élève non trouvé', 404)
    }

    // Si seulement le champ actif est envoyé (archivage/réactivation)
    if (Object.keys(body).length === 1 && 'actif' in body) {
      const eleve = await prisma.eleve.update({
        where: { id },
        data: { actif: body.actif },
      })

      return apiSuccess({ eleve })
    }

    // Sinon, modification complète
    const { nom, prenom, niveau, sexe } = body

    // Validation
    if (!nom || !prenom || !niveau || !sexe) {
      return apiError('Tous les champs sont requis', 400)
    }

    if (sexe !== 'M' && sexe !== 'F') {
      return apiError('Sexe doit être M ou F', 400)
    }

    // Mettre à jour l'élève
    const eleve = await prisma.eleve.update({
      where: { id },
      data: {
        nom,
        prenom,
        niveau,
        sexe,
      },
    })

    return apiSuccess({ eleve })
  } catch (error) {
    return apiServerError('Erreur modification élève', error)
  }
}

/**
 * DELETE /api/admin/eleves/[id]
 * Supprimer un élève définitivement
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    // Vérifier que l'élève existe
    const existing = await prisma.eleve.findUnique({
      where: { id },
    })

    if (!existing) {
      return apiError('Élève non trouvé', 404)
    }

    // Supprimer l'élève (les appels associés seront supprimés en cascade)
    await prisma.eleve.delete({
      where: { id },
    })

    return apiSuccess({})
  } catch (error) {
    return apiServerError('Erreur suppression élève', error)
  }
}
