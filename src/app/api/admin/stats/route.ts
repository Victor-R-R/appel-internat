// API pour les statistiques globales (admin uniquement)
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/stats
 * Retourne les stats globales pour le dashboard admin
 */
export async function GET() {
  try {
    // Compter en parallèle (plus rapide)
    const [totalAED, totalEleves, totalAppels, totalRecaps] = await Promise.all([
      prisma.user.count({
        where: { role: 'aed' },
      }),
      prisma.eleve.count({
        where: { actif: true },
      }),
      prisma.appel.count(),
      prisma.recap.count(),
    ])

    return NextResponse.json({
      success: true,
      stats: {
        totalAED,
        totalEleves,
        totalAppels,
        totalRecaps,
      },
    })
  } catch (error) {
    console.error('Erreur stats admin:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
