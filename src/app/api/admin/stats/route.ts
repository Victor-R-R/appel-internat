// API pour les statistiques globales (admin uniquement)
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiServerError } from '@/lib/api-helpers'

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

    return apiSuccess({
      stats: {
        totalAED,
        totalEleves,
        totalAppels,
        totalRecaps,
      },
    })
  } catch (error) {
    return apiServerError('Erreur stats admin', error)
  }
}
