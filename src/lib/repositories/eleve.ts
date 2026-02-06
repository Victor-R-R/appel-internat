/**
 * Eleve Repository - Fonctions pures pour les opérations Eleve
 */

import { prisma } from '@/lib/prisma'
import type { Niveau, Sexe } from '@/lib/constants'

/**
 * Trouve tous les élèves avec filtres optionnels
 */
export async function findAllEleves(filters?: {
  niveau?: Niveau
  sexe?: Sexe
  actif?: boolean
}) {
  return prisma.eleve.findMany({
    where: filters,
    orderBy: [
      { niveau: 'asc' },
      { nom: 'asc' },
      { prenom: 'asc' },
    ],
  })
}

/**
 * Trouve un élève par ID
 */
export async function findEleveById(id: string) {
  return prisma.eleve.findUnique({
    where: { id },
  })
}

/**
 * Trouve les élèves actifs par niveau et sexe
 * Utilisé pour l'appel quotidien
 */
export async function findActiveByNiveauAndSexe(niveau: Niveau, sexe: Sexe) {
  return prisma.eleve.findMany({
    where: {
      niveau,
      sexe,
      actif: true,
    },
    orderBy: [
      { nom: 'asc' },
      { prenom: 'asc' },
    ],
  })
}

/**
 * Crée un nouvel élève
 */
export async function createEleve(data: {
  nom: string
  prenom: string
  niveau: Niveau
  sexe: Sexe
  actif?: boolean
}) {
  return prisma.eleve.create({
    data: {
      ...data,
      actif: data.actif ?? true,
    },
  })
}

/**
 * Met à jour un élève
 */
export async function updateEleve(
  id: string,
  data: {
    nom?: string
    prenom?: string
    niveau?: Niveau
    sexe?: Sexe
    actif?: boolean
  }
) {
  return prisma.eleve.update({
    where: { id },
    data,
  })
}

/**
 * Supprime un élève
 */
export async function deleteEleve(id: string) {
  return prisma.eleve.delete({
    where: { id },
  })
}

/**
 * Compte les élèves actifs
 */
export async function countActiveEleves() {
  return prisma.eleve.count({
    where: { actif: true },
  })
}
