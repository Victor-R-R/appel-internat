// API pour récupérer tous les récaps (superadmin uniquement)
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/recaps
 * Liste tous les récaps de tous les niveaux
 */
export async function GET() {
  try {
    const recaps = await prisma.recap.findMany({
      orderBy: [
        { date: 'desc' },
        { niveau: 'asc' },
      ],
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
