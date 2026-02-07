/**
 * Types partagés - Types utilisés à travers l'application (frontend et API)
 */

import type { Niveau, Role, Statut, Sexe } from './constants';

// Re-export types for convenience
export type { Role, Niveau, Statut, Sexe };

/**
 * User DTO (sans password) - utilisé pour les réponses API et le frontend
 */
export type UserDTO = {
  id: string;
  email: string;
  role: Role;
  nom?: string;
  prenom?: string;
  niveau?: Niveau | null;
  sexeGroupe?: Sexe | null;
};

/**
 * Eleve DTO - représentation simplifiée d'un élève
 */
export type EleveDTO = {
  id: string;
  nom: string;
  prenom: string;
  niveau: Niveau;
  sexe: Sexe;
};

/**
 * AED Slim - représentation simplifiée d'un AED (pour les listes)
 */
export type AedSlim = {
  id: string;
  email: string;
  role: Role;
  nom?: string;
  prenom?: string;
  niveau?: Niveau | null;
  sexeGroupe?: Sexe | null;
};

/**
 * Appel Data - données d'un appel individuel
 */
export type AppelData = {
  eleveId: string;
  statut: Statut;
};
