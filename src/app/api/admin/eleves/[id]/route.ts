// API pour modifier/supprimer un élève spécifique
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, apiServerError } from '@/lib/api-helpers'
import { eleveUpdateSchema, validateRequest } from '@/lib/validation'

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

    // Validation avec Zod
    const validation = validateRequest(eleveUpdateSchema, body)
    if (!validation.success) {
      return apiError(validation.error, 400)
    }

    const { nom, prenom, niveau, sexe, actif } = validation.data

    // Vérifier que l'élève existe
    const existing = await prisma.eleve.findUnique({
      where: { id },
    })

    if (!existing) {
      return apiError('Élève non trouvé', 404)
    }

    // Préparer les données de mise à jour (seulement les champs fournis)
    const updateData: {
      nom?: string
      prenom?: string
      niveau?: string
      sexe?: string
      actif?: boolean
    } = {}

    if (nom) updateData.nom = nom
    if (prenom) updateData.prenom = prenom
    if (niveau) updateData.niveau = niveau
    if (sexe) updateData.sexe = sexe
    if (actif !== undefined) updateData.actif = actif

    // Mettre à jour l'élève
    const eleve = await prisma.eleve.update({
      where: { id },
      data: updateData,
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
