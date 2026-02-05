// API pour récupérer l'historique des appels
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/appels?date=2024-01-15&niveau=6eme
 * Récupère l'historique des appels avec filtres
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    const niveauParam = searchParams.get('niveau')

    // Construire les filtres
    const where: any = {}

    // Filtre par date si fourni
    if (dateParam) {
      const date = new Date(dateParam)
      date.setUTCHours(0, 0, 0, 0)
      where.date = date
    }

    // Filtre par niveau si fourni
    if (niveauParam && niveauParam !== 'tous') {
      where.niveau = niveauParam
    }

    // Récupérer les appels avec les informations de l'élève et de l'AED
    const appels = await prisma.appel.findMany({
      where,
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
            email: true,
          },
        },
      },
      orderBy: [
        { niveau: 'asc' },
        { date: 'desc' },
        { eleve: { nom: 'asc' } },
      ],
    })

    // Grouper les appels par niveau et date
    const grouped = appels.reduce((acc, appel) => {
      const key = `${appel.niveau}_${appel.date.toISOString().split('T')[0]}`
      if (!acc[key]) {
        acc[key] = {
          niveau: appel.niveau,
          date: appel.date,
          appels: [],
          aed: appel.aed, // Premier AED trouvé pour ce groupe
        }
      }
      acc[key].appels.push({
        id: appel.id,
        statut: appel.statut,
        observation: appel.observation,
        eleve: appel.eleve,
      })
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      success: true,
      groups: Object.values(grouped),
      total: appels.length,
    })
  } catch (error) {
    console.error('Erreur récupération appels:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
