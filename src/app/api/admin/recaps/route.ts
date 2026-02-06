// API pour récupérer tous les récaps (superadmin uniquement)
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiServerError, normalizeDate } from '@/lib/api-helpers'

/**
 * GET /api/admin/recaps
 * Liste tous les récaps quotidiens
 * Query params: ?date=YYYY-MM-DD (optionnel, pour récupérer un récap spécifique)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')

    if (dateParam) {
      // Récupérer un récap spécifique
      const targetDate = normalizeDate(dateParam)

      const recap = await prisma.recap.findUnique({
        where: { date: targetDate },
      })

      return apiSuccess({ recap })
    }

    // Récupérer tous les récaps
    const recaps = await prisma.recap.findMany({
      orderBy: { date: 'desc' },
    })

    return apiSuccess({ recaps })
  } catch (error) {
    return apiServerError('Erreur liste récaps', error)
  }
}
