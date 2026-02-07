/**
 * Appel Repository - Fonctions pures pour les opérations Appel
 */

import { prisma } from '@/lib/prisma'
import { APPEL_INCLUDE_FULL, APPEL_INCLUDE_MINIMAL } from '@/lib/prisma-selects'
import type { Niveau, Sexe, Statut } from '@/lib/constants'

/**
 * Trouve les appels par niveau et date
 * Utilisé pour récupérer l'appel existant du jour
 */
export async function findByNiveauAndDate(niveau: Niveau, date: Date) {
  return prisma.appel.findMany({
    where: {
      niveau,
      date,
    },
    include: APPEL_INCLUDE_MINIMAL,
    orderBy: {
      eleve: { nom: 'asc' },
    },
  })
}

/**
 * Trouve les appels avec filtres (pour l'historique admin)
 */
export async function findWithFilters(filters: {
  dateRange?: { start: Date; end: Date }
  niveau?: Niveau
  sexe?: Sexe
}) {
  const where: any = {}

  if (filters.dateRange) {
    where.date = {
      gte: filters.dateRange.start,
      lte: filters.dateRange.end,
    }
  }

  if (filters.niveau) {
    where.niveau = filters.niveau
  }

  if (filters.sexe) {
    where.eleve = {
      sexe: filters.sexe,
    }
  }

  return prisma.appel.findMany({
    where,
    include: APPEL_INCLUDE_FULL,
    orderBy: [
      { niveau: 'asc' },
      { date: 'desc' },
      { eleve: { nom: 'asc' } },
    ],
  })
}


/**
 * Remplace tous les appels d'un niveau pour une date
 * Utilisé lors de la sauvegarde d'un appel (delete + create)
 */
export async function replaceForNiveauAndDate(
  niveau: Niveau,
  date: Date,
  appels: Array<{
    eleveId: string
    aedId: string
    statut: Statut
  }>
) {
  // Transaction : supprimer les anciens appels puis créer les nouveaux
  return prisma.$transaction(async (tx) => {
    // Supprimer les appels existants
    await tx.appel.deleteMany({
      where: { niveau, date },
    })

    // Créer les nouveaux appels
    const created = await tx.appel.createMany({
      data: appels.map((appel) => ({
        ...appel,
        niveau,
        date,
      })),
    })

    return created
  })
}

/**
 * Upsert une observation de groupe
 * Utilisé pour sauvegarder l'observation d'un groupe (niveau + sexeGroupe) pour une date
 */
export async function upsertObservationGroupe(data: {
  date: Date
  niveau: Niveau
  sexeGroupe: Sexe
  observation: string
  aedId: string
}) {
  return prisma.observationGroupe.upsert({
    where: {
      date_niveau_sexeGroupe: {
        date: data.date,
        niveau: data.niveau,
        sexeGroupe: data.sexeGroupe,
      },
    },
    update: {
      observation: data.observation,
      aedId: data.aedId,
    },
    create: data,
  })
}

/**
 * Trouve l'observation d'un groupe pour une date
 * Utilisé pour charger l'observation existante lors de l'affichage de l'appel
 */
export async function findObservationGroupe(
  date: Date,
  niveau: Niveau,
  sexeGroupe: Sexe
) {
  return prisma.observationGroupe.findUnique({
    where: {
      date_niveau_sexeGroupe: {
        date,
        niveau,
        sexeGroupe,
      },
    },
  })
}

/**
 * Trouve toutes les observations de groupe pour une date
 * Utilisé pour la génération de récaps
 */
export async function findGroupObservationsForDate(date: Date) {
  return prisma.observationGroupe.findMany({
    where: {
      date,
      AND: [
        { observation: { not: null } },
        { observation: { not: '' } },
      ],
    },
    orderBy: [
      { niveau: 'asc' },
      { sexeGroupe: 'asc' },
    ],
  })
}

/**
 * Compte le nombre total d'appels
 */
export async function countAllAppels() {
  return prisma.appel.count()
}
