/**
 * User Repository - Fonctions pures pour les opérations User
 */

import { prisma } from '@/lib/prisma'
import { USER_PUBLIC_SELECT, USER_PUBLIC_SELECT_NO_DATE } from '@/lib/prisma-selects'
import type { Role, Niveau, Sexe } from '@/lib/constants'

/**
 * Trouve tous les utilisateurs
 */
export async function findAllUsers() {
  return prisma.user.findMany({
    orderBy: [
      { role: 'asc' },
      { niveau: 'asc' },
      { nom: 'asc' },
    ],
    select: USER_PUBLIC_SELECT,
  })
}

/**
 * Trouve un utilisateur par ID
 */
export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  })
}

/**
 * Trouve un utilisateur par email
 */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}

/**
 * Vérifie si un email est déjà utilisé
 */
export async function isEmailTaken(email: string, excludeUserId?: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) return false
  if (excludeUserId && user.id === excludeUserId) return false
  return true
}

/**
 * Crée un nouvel utilisateur
 */
export async function createUser(data: {
  email: string
  password: string
  nom: string
  prenom: string
  role: Role
  niveau?: Niveau | null
  sexeGroupe?: Sexe | null
}) {
  return prisma.user.create({
    data,
    select: USER_PUBLIC_SELECT_NO_DATE,
  })
}

/**
 * Met à jour un utilisateur
 */
export async function updateUser(
  id: string,
  data: {
    email?: string
    password?: string
    nom?: string
    prenom?: string
    role?: Role
    niveau?: Niveau | null
    sexeGroupe?: Sexe | null
  }
) {
  return prisma.user.update({
    where: { id },
    data,
    select: USER_PUBLIC_SELECT_NO_DATE,
  })
}

/**
 * Supprime un utilisateur
 */
export async function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
  })
}
