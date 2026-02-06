// API Route pour le login des AED
// Next.js App Router : les routes API sont dans /app/api/

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import { createToken, setAuthCookie } from '@/lib/jwt'
import { loginSchema, validateRequest } from '@/lib/validation'
import { checkRateLimit, resetRateLimit, getClientIp } from '@/lib/rate-limit'

/**
 * POST /api/auth/login
 * Body: { email: string, password: string }
 * Retourne: { success: true, user: {...} } ou { success: false, error: string }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting : 5 tentatives par IP toutes les 15 minutes
    const clientIp = getClientIp(request)
    const rateLimit = checkRateLimit(clientIp, {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
    })

    if (!rateLimit.success) {
      const resetIn = Math.ceil((rateLimit.resetAt - Date.now()) / 1000 / 60)
      return NextResponse.json(
        {
          success: false,
          error: `Trop de tentatives. Réessayez dans ${resetIn} minute(s)`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          },
        }
      )
    }

    // 2. Récupérer et valider les données du formulaire
    const body = await request.json()
    const validation = validateRequest(loginSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

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

    // 5. Login réussi → réinitialiser le rate limit pour cette IP
    resetRateLimit(clientIp)

    // 6. Créer le token JWT avec les infos utilisateur
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      nom: user.nom,
      prenom: user.prenom,
      niveau: user.niveau,
      sexeGroupe: user.sexeGroupe,
    })

    // 7. Stocker le token dans un cookie HttpOnly sécurisé
    await setAuthCookie(token)

    // 8. Retourner succès (sans données sensibles, le cookie contient tout)
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
