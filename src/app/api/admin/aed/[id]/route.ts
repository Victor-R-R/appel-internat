// API pour modifier/supprimer un AED spécifique
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/admin/aed/[id]
 * Modifier un utilisateur
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { email, password, nom, prenom, niveau, sexeGroupe, role } = body

    // Validation basique
    if (!email || !nom || !prenom) {
      return NextResponse.json(
        { success: false, error: 'Email, nom et prénom sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur existe
    const existing = await prisma.user.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
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

    // Déterminer le rôle (garder l'existant si non fourni)
    const userRole = role || existing.role
    const adminRoles = ['cpe', 'manager', 'superadmin']
    const isAdminRole = adminRoles.includes(userRole)

    // Préparer les données de mise à jour
    const updateData: {
      email: string
      nom: string
      prenom: string
      role: string
      niveau: string | null
      sexeGroupe: string | null
      password?: string
    } = {
      email,
      nom,
      prenom,
      role: userRole,
      niveau: isAdminRole ? null : (niveau || existing.niveau),
      sexeGroupe: isAdminRole ? null : (sexeGroupe || existing.sexeGroupe),
    }

    // Hasher le nouveau mot de passe si fourni
    if (password && password.trim() !== '') {
      updateData.password = await hashPassword(password)
    }

    // Mettre à jour l'utilisateur
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        niveau: true,
        sexeGroupe: true,
      },
    })

    return NextResponse.json({
      success: true,
      aed: user, // Garde le même nom pour compatibilité
    })
  } catch (error) {
    console.error('Erreur modification utilisateur:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/aed/[id]
 * Supprimer un utilisateur
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    // Vérifier que l'utilisateur existe
    const existing = await prisma.user.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer l'utilisateur (les appels associés seront supprimés en cascade si configuré)
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
