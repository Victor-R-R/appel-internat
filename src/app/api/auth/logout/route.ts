/**
 * API Route pour déconnexion
 * POST /api/auth/logout
 */

import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/jwt'

export async function POST() {
  try {
    // Supprimer le cookie d'authentification
    await clearAuthCookie()

    return NextResponse.json({
      success: true,
      message: 'Déconnexion réussie',
    })
  } catch (error) {
    console.error('Erreur logout:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
