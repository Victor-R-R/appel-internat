/**
 * Constants - Source de vérité unique pour toutes les constantes de l'application
 */

// Niveaux scolaires - valeurs canoniques alignées sur la DB
export const NIVEAUX = ['6eme', '5eme', '4eme', '3eme', '2nde', '1ere', 'Term'] as const;
export type Niveau = typeof NIVEAUX[number];

// Rôles utilisateurs
export const ROLES = ['aed', 'cpe', 'manager', 'superadmin'] as const;
export type Role = typeof ROLES[number];

// Rôles administrateurs
export const ADMIN_ROLES: Role[] = ['cpe', 'manager', 'superadmin'];

// Statuts d'appel
export const STATUTS = ['present', 'acf', 'absent'] as const;
export type Statut = typeof STATUTS[number];

// Sexes
export const SEXES = ['M', 'F'] as const;
export type Sexe = typeof SEXES[number];

/**
 * Helper pour vérifier si un rôle est un rôle admin
 */
export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role as Role);
}
