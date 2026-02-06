/**
 * Prisma Select Constants - Constantes de sélection Prisma pour éviter les duplications
 */

import type { Prisma } from '@prisma/client'

/**
 * Select public pour User (sans password)
 * Utilisé dans : admin/aed routes (GET, POST, PATCH)
 */
export const USER_PUBLIC_SELECT = {
  id: true,
  email: true,
  nom: true,
  prenom: true,
  role: true,
  niveau: true,
  sexeGroupe: true,
  createdAt: true,
} satisfies Prisma.UserSelect

/**
 * Select public pour User sans createdAt
 * Utilisé pour les opérations de modification
 */
export const USER_PUBLIC_SELECT_NO_DATE = {
  id: true,
  email: true,
  nom: true,
  prenom: true,
  role: true,
  niveau: true,
  sexeGroupe: true,
} satisfies Prisma.UserSelect

/**
 * Select pour Eleve dans les includes d'appel
 * Utilisé dans : admin/appels, appel, admin/recaps/generate
 */
export const ELEVE_SELECT = {
  id: true,
  nom: true,
  prenom: true,
  niveau: true,
  sexe: true,
} satisfies Prisma.EleveSelect

/**
 * Select pour AED (slim) dans les includes d'appel
 * Utilisé dans : admin/appels
 */
export const AED_SELECT_WITH_EMAIL = {
  id: true,
  nom: true,
  prenom: true,
  email: true,
} satisfies Prisma.UserSelect

/**
 * Select pour AED (minimal) dans les includes d'appel
 * Utilisé dans : appel
 */
export const AED_SELECT_MINIMAL = {
  id: true,
  nom: true,
  prenom: true,
} satisfies Prisma.UserSelect

/**
 * Include pour les appels avec élève et AED complets
 * Utilisé dans : admin/appels
 */
export const APPEL_INCLUDE_FULL = {
  eleve: { select: ELEVE_SELECT },
  aed: { select: AED_SELECT_WITH_EMAIL },
} satisfies Prisma.AppelInclude

/**
 * Include pour les appels avec élève et AED minimaux
 * Utilisé dans : appel (GET)
 */
export const APPEL_INCLUDE_MINIMAL = {
  eleve: { select: ELEVE_SELECT },
  aed: { select: AED_SELECT_MINIMAL },
} satisfies Prisma.AppelInclude
