// API Route pour le login des AED
// Next.js App Router : les routes API sont dans /app/api/

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'

/**
 * POST /api/auth/login
 * Body: { email: string, password: string }
 * Retourne: { success: true, user: {...} } ou { success: false, error: string }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Récupérer les données du formulaire
    const body = await request.json()
    const { email, password } = body

    // 2. Validation basique
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // 3. Chercher l'utilisateur dans la BDD
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // 4. Vérifier le mot de passe (compare avec le hash bcrypt)
    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // 5. Succès ! On retourne les infos user (SANS le password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error('Erreur login:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
