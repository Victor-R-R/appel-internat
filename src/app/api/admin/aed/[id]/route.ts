// API pour modifier/supprimer un AED spécifique
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/admin/aed/[id]
 * Modifier un AED
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { email, password, nom, prenom, niveau } = body

    // Validation
    if (!email || !nom || !prenom || !niveau) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis (sauf mot de passe)' },
        { status: 400 }
      )
    }

    // Vérifier que l'AED existe
    const existing = await prisma.user.findUnique({
      where: { id },
    })

    if (!existing || existing.role !== 'aed') {
      return NextResponse.json(
        { success: false, error: 'AED non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que l'email n'est pas déjà pris par un autre utilisateur
    if (email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email },
      })

      if (emailTaken) {
        return NextResponse.json(
          { success: false, error: 'Cet email est déjà utilisé' },
          { status: 400 }
        )
      }
    }

    // Préparer les données de mise à jour
    const updateData: {
      email: string
      nom: string
      prenom: string
      niveau: string
      password?: string
    } = {
      email,
      nom,
      prenom,
      niveau,
    }

    // Hasher le nouveau mot de passe si fourni
    if (password && password.trim() !== '') {
      updateData.password = await hashPassword(password)
    }

    // Mettre à jour l'AED
    const aed = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        niveau: true,
      },
    })

    return NextResponse.json({
      success: true,
      aed,
    })
  } catch (error) {
    console.error('Erreur modification AED:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/aed/[id]
 * Supprimer un AED
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    // Vérifier que l'AED existe
    const existing = await prisma.user.findUnique({
      where: { id },
    })

    if (!existing || existing.role !== 'aed') {
      return NextResponse.json(
        { success: false, error: 'AED non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer l'AED (les appels associés seront supprimés en cascade si configuré)
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Erreur suppression AED:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
