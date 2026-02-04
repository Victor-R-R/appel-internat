// API pour sauvegarder un appel complet
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { appelCompletSchema, validateRequest } from '@/lib/validation'

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
