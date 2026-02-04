// API CRUD pour les AED (superadmin uniquement)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

/**
 * GET /api/admin/aed
 * Liste tous les AED
 */
export async function GET() {
  try {
    const aeds = await prisma.user.findMany({
      where: { role: 'aed' },
      orderBy: [
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
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      aeds,
    })
  } catch (error) {
    console.error('Erreur liste AED:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/aed
 * Créer un nouvel AED
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, nom, prenom, niveau } = body

    // Validation
    if (!email || !password || !nom || !prenom || !niveau) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
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

    // Créer l'AED
    const aed = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nom,
        prenom,
        niveau,
        role: 'aed',
      },
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
    console.error('Erreur création AED:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
