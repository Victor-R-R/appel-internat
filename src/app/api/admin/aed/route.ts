// API CRUD pour les AED (superadmin uniquement)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { aedSchema, validateRequest } from '@/lib/validation'

/**
 * GET /api/admin/aed
 * Liste tous les utilisateurs (AED, CPE, Manager, Superadmin)
 */
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: [
        { role: 'asc' },
        { niveau: 'asc' },
        { nom: 'asc' },
      ],
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        niveau: true,
        sexeGroupe: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      aeds: users, // Garde le même nom pour compatibilité
    })
  } catch (error) {
    console.error('Erreur liste utilisateurs:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/aed
 * Créer un nouvel utilisateur (AED, CPE, Manager, Superadmin)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation avec Zod (niveau et sexeGroupe optionnels pour CPE/Manager/Superadmin)
    const validation = validateRequest(aedSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    const { email, password, nom, prenom, niveau, sexeGroupe, role } = validation.data

    // Le password doit être présent lors de la création
    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Le mot de passe est requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'email n'existe pas déjà
    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password)

    // Pour CPE, Manager et Superadmin, niveau et sexeGroupe sont null (accès complet)
    const adminRoles = ['cpe', 'manager', 'superadmin']
    const isAdminRole = adminRoles.includes(role || 'aed')

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nom,
        prenom,
        niveau: isAdminRole ? null : niveau,
        sexeGroupe: isAdminRole ? null : sexeGroupe,
        role: role || 'aed',
      },
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
    console.error('Erreur création utilisateur:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
