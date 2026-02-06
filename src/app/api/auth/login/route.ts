// API Route pour le login des AED
// Next.js App Router : les routes API sont dans /app/api/

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import { createToken, setAuthCookie } from '@/lib/jwt'
import { loginSchema, validateRequest } from '@/lib/validation'
import { apiSuccess, apiError, apiServerError } from '@/lib/api-helpers'

/**
 * POST /api/auth/login
 * Body: { email: string, password: string }
 * Retourne: { success: true, user: {...} } ou { success: false, error: string }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Récupérer et valider les données du formulaire
    const body = await request.json()
    const validation = validateRequest(loginSchema, body)

    if (!validation.success) {
      return apiError(validation.error)
    }

    const { email, password } = validation.data

    // 2. Chercher l'utilisateur dans la BDD
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return apiError('Email ou mot de passe incorrect', 401)
    }

    // 3. Vérifier le mot de passe (compare avec le hash bcrypt)
    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      return apiError('Email ou mot de passe incorrect', 401)
    }

    // 4. Créer le token JWT avec les infos utilisateur
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      nom: user.nom,
      prenom: user.prenom,
      niveau: user.niveau,
      sexeGroupe: user.sexeGroupe,
    })

    // 5. Stocker le token dans un cookie HttpOnly sécurisé
    await setAuthCookie(token)

    // 6. Retourner succès (sans données sensibles, le cookie contient tout)
    const { password: _, ...userWithoutPassword } = user

    return apiSuccess({ user: userWithoutPassword })
  } catch (error) {
    return apiServerError('Erreur login', error)
  }
}
