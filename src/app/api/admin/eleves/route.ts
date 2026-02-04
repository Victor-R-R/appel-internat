// API CRUD pour les élèves (superadmin uniquement)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { eleveSchema, validateRequest } from '@/lib/validation'

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

    return NextResponse.json({
      success: true,
      eleves,
    })
  } catch (error) {
    console.error('Erreur liste élèves:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
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
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
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

    return NextResponse.json({
      success: true,
      eleve,
    })
  } catch (error) {
    console.error('Erreur création élève:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
