// API pour sauvegarder et récupérer les appels
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { appelCompletSchema, validateRequest } from '@/lib/validation'

/**
 * GET /api/appel?niveau=6eme&date=2024-01-15
 * Récupère l'appel du jour pour un niveau
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const niveau = searchParams.get('niveau')
    const dateParam = searchParams.get('date')

    if (!niveau) {
      return NextResponse.json(
        { success: false, error: 'Niveau requis' },
        { status: 400 }
      )
    }

    // Date du jour ou date fournie
    const date = dateParam ? new Date(dateParam) : new Date()
    date.setUTCHours(0, 0, 0, 0)

    // Récupérer les appels existants pour ce niveau et cette date
    const appels = await prisma.appel.findMany({
      where: {
        niveau,
        date,
      },
      include: {
        eleve: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            niveau: true,
            sexe: true,
          },
        },
        aed: {
          select: {
            id: true,
            nom: true,
            prenom: true,
          },
        },
      },
      orderBy: {
        eleve: { nom: 'asc' },
      },
    })

    // Si aucun appel trouvé
    if (appels.length === 0) {
      return NextResponse.json({
        success: true,
        appels: [],
        exists: false,
      })
    }

    // Formater les données pour le frontend
    const formattedAppels = appels.map((appel) => ({
      eleveId: appel.eleveId,
      statut: appel.statut,
      observation: appel.observation || '',
      eleve: appel.eleve,
    }))

    return NextResponse.json({
      success: true,
      appels: formattedAppels,
      exists: true,
      aed: appels[0].aed, // Info de l'AED qui a fait l'appel
      date: appels[0].date,
    })
  } catch (error) {
    console.error('Erreur récupération appel:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/appel
 * Body: { aedId: string, niveau: string, appels: AppelData[] }
 * Sauvegarde l'appel de toute une classe
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation avec Zod
    const validation = validateRequest(appelCompletSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    const { aedId, niveau, appels } = validation.data

    // Date du jour en UTC (évite les problèmes de timezone)
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    // Supprimer les appels existants pour ce niveau aujourd'hui
    // (permet de refaire l'appel si erreur)
    await prisma.appel.deleteMany({
      where: {
        niveau,
        date: today,
      },
    })

    // Créer tous les nouveaux appels
    // createMany = batch insert (plus rapide que des INSERT individuels)
    const result = await prisma.appel.createMany({
      data: appels.map((appel) => ({
        eleveId: appel.eleveId,
        aedId,
        niveau,
        date: today,
        statut: appel.statut,
        observation: appel.observation || null,
      })),
    })

    return NextResponse.json({
      success: true,
      count: result.count, // Nombre d'appels créés
    })
  } catch (error) {
    console.error('Erreur sauvegarde appel:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
