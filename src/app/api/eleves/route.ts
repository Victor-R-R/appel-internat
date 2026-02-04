// API pour récupérer les élèves d'un niveau
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/eleves?niveau=6eme
 * Retourne la liste des élèves actifs d'un niveau
 */
export async function GET(request: NextRequest) {
  try {
    // Récupérer le paramètre "niveau" de l'URL
    const searchParams = request.nextUrl.searchParams
    const niveau = searchParams.get('niveau')

    if (!niveau) {
      return NextResponse.json(
        { success: false, error: 'Niveau requis' },
        { status: 400 }
      )
    }

    // Chercher les élèves actifs de ce niveau
    const eleves = await prisma.eleve.findMany({
      where: {
        niveau,
        actif: true, // Seulement les élèves encore présents
      },
      orderBy: [
        { nom: 'asc' },     // Tri par nom
        { prenom: 'asc' },  // puis prénom
      ],
    })

    return NextResponse.json({
      success: true,
      eleves,
    })
  } catch (error) {
    console.error('Erreur récupération élèves:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
