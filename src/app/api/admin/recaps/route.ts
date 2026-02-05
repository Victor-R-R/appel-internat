// API pour récupérer tous les récaps (superadmin uniquement)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
      const targetDate = new Date(dateParam)
      targetDate.setUTCHours(0, 0, 0, 0)

      const recap = await prisma.recap.findUnique({
        where: { date: targetDate },
      })

      return NextResponse.json({
        success: true,
        recap,
      })
    }

    // Récupérer tous les récaps
    const recaps = await prisma.recap.findMany({
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({
      success: true,
      recaps,
    })
  } catch (error) {
    console.error('Erreur liste récaps:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
