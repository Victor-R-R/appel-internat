// API pour sauvegarder un appel complet
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type AppelData = {
  eleveId: string
  statut: string
  observation: string
}

/**
 * POST /api/appel
 * Body: { aedId: string, niveau: string, appels: AppelData[] }
 * Sauvegarde l'appel de toute une classe
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { aedId, niveau, appels } = body

    // Validation
    if (!aedId || !niveau || !appels || !Array.isArray(appels)) {
      return NextResponse.json(
        { success: false, error: 'Données invalides' },
        { status: 400 }
      )
    }

    // Date du jour (minuit pour regrouper tous les appels du même jour)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

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
      data: appels.map((appel: AppelData) => ({
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
