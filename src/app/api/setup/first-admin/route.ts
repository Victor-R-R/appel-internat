/**
 * API Route pour créer le premier admin en production
 * ⚠️ À SUPPRIMER après utilisation pour des raisons de sécurité !
 *
 * Usage:
 * POST /api/setup/first-admin
 * Body: { email: string, password: string }
 *
 * Sécurité:
 * - Ne fonctionne QUE si aucun superadmin n'existe
 * - À supprimer manuellement après création du premier admin
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier si un superadmin existe déjà
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'superadmin' },
    })

    if (existingAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Un superadmin existe déjà. Cet endpoint ne peut être utilisé qu\'une seule fois.',
        },
        { status: 403 }
      )
    }

    // 2. Récupérer les données du body
    const body = await request.json()
    const { email, password, nom = 'Admin', prenom = 'Premier' } = body

    // 3. Validation basique
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email et mot de passe requis',
        },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le mot de passe doit contenir au moins 8 caractères',
        },
        { status: 400 }
      )
    }

    // 4. Hash du mot de passe
    const hashedPassword = await hashPassword(password)

    // 5. Créer le premier superadmin
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nom,
        prenom,
        role: 'superadmin',
        niveau: null, // Superadmin n'a pas de niveau (accès à tous)
        sexeGroupe: null,
      },
    })

    // 6. Retourner succès (sans le password hash)
    const { password: _, ...adminWithoutPassword } = admin

    return NextResponse.json({
      success: true,
      message: 'Premier superadmin créé avec succès',
      admin: adminWithoutPassword,
      warning: '⚠️ SUPPRIMEZ IMMÉDIATEMENT ce fichier route.ts pour sécuriser votre application !',
    })
  } catch (error) {
    console.error('Erreur lors de la création du premier admin:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur lors de la création',
      },
      { status: 500 }
    )
  }
}

/**
 * GET pour vérifier si un admin existe (sans créer)
 * Utile pour savoir si l'endpoint est encore nécessaire
 */
export async function GET() {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'superadmin' },
    })

    return NextResponse.json({
      adminExists: !!existingAdmin,
      message: existingAdmin
        ? 'Un superadmin existe déjà. Supprimez cet endpoint.'
        : 'Aucun superadmin trouvé. Vous pouvez utiliser POST pour en créer un.',
    })
  } catch (error) {
    console.error('Erreur lors de la vérification:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur',
      },
      { status: 500 }
    )
  }
}
