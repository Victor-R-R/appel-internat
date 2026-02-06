// API CRUD pour les AED (superadmin uniquement)
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { aedSchema, validateRequest } from '@/lib/validation'
import { isAdminRole } from '@/lib/constants'
import { apiSuccess, apiError, apiServerError } from '@/lib/api-helpers'
import { USER_PUBLIC_SELECT, USER_PUBLIC_SELECT_NO_DATE } from '@/lib/prisma-selects'

/**
 * GET /api/admin/aed
 * Liste tous les utilisateurs (AED, CPE, Manager, Superadmin)
 */
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: [
        { role: 'asc' },
        { niveau: 'asc' },
        { nom: 'asc' },
      ],
      select: USER_PUBLIC_SELECT,
    })

    return apiSuccess({
      aeds: users, // Garde le même nom pour compatibilité
    })
  } catch (error) {
    return apiServerError('Erreur liste utilisateurs', error)
  }
}

/**
 * POST /api/admin/aed
 * Créer un nouvel utilisateur (AED, CPE, Manager, Superadmin)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation avec Zod (niveau et sexeGroupe optionnels pour CPE/Manager/Superadmin)
    const validation = validateRequest(aedSchema, body)
    if (!validation.success) {
      return apiError(validation.error, 400)
    }

    const { email, password, nom, prenom, niveau, sexeGroupe, role } = validation.data

    // Le password doit être présent lors de la création
    if (!password) {
      return apiError('Le mot de passe est requis', 400)
    }

    // Vérifier que l'email n'existe pas déjà
    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      return apiError('Cet email est déjà utilisé', 400)
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password)

    // Pour CPE, Manager et Superadmin, niveau et sexeGroupe sont null (accès complet)
    const isAdmin = isAdminRole(role || 'aed')

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nom,
        prenom,
        niveau: isAdmin ? null : niveau,
        sexeGroupe: isAdmin ? null : sexeGroupe,
        role: role || 'aed',
      },
      select: USER_PUBLIC_SELECT_NO_DATE,
    })

    return apiSuccess({
      aed: user, // Garde le même nom pour compatibilité
    })
  } catch (error) {
    return apiServerError('Erreur création utilisateur', error)
  }
}
