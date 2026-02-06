/**
 * API Route pour récupérer l'utilisateur connecté depuis le JWT cookie
 * GET /api/auth/me
 */

import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'

export async function GET() {
  try {
    // Récupérer la session depuis le cookie JWT
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Retourner les infos utilisateur
    return NextResponse.json({
      success: true,
      user: {
        id: session.userId,
        email: session.email,
        role: session.role,
        nom: session.nom,
        prenom: session.prenom,
        niveau: session.niveau,
        sexeGroupe: session.sexeGroupe,
      },
    })
  } catch (error) {
    console.error('Erreur /api/auth/me:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
