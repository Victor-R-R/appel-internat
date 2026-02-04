// API pour modifier/supprimer un élève spécifique
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
      return NextResponse.json(
        { success: false, error: 'Élève non trouvé' },
        { status: 404 }
      )
    }

    // Si seulement le champ actif est envoyé (archivage/réactivation)
    if (Object.keys(body).length === 1 && 'actif' in body) {
      const eleve = await prisma.eleve.update({
        where: { id },
        data: { actif: body.actif },
      })

      return NextResponse.json({
        success: true,
        eleve,
      })
    }

    // Sinon, modification complète
    const { nom, prenom, niveau, sexe } = body

    // Validation
    if (!nom || !prenom || !niveau || !sexe) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    if (sexe !== 'M' && sexe !== 'F') {
      return NextResponse.json(
        { success: false, error: 'Sexe doit être M ou F' },
        { status: 400 }
      )
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

    return NextResponse.json({
      success: true,
      eleve,
    })
  } catch (error) {
    console.error('Erreur modification élève:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
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
      return NextResponse.json(
        { success: false, error: 'Élève non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer l'élève (les appels associés seront supprimés en cascade)
    await prisma.eleve.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Erreur suppression élève:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
