/**
 * Schémas de validation Zod pour les API routes
 */

import { z } from 'zod'
import { NIVEAUX, ROLES, STATUTS } from './constants'

// Valeurs autorisées importées depuis constants.ts
const niveauxValides = NIVEAUX
const statutsValides = STATUTS
const rolesValides = ROLES

// Validation login
export const loginSchema = z.object({
  email: z
    .string()
    .email('Email invalide')
    .min(1, 'Email requis'),
  password: z
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

// Validation d'un élève
export const eleveSchema = z.object({
  nom: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  prenom: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
  niveau: z.enum(niveauxValides, {
    message: 'Niveau invalide',
  }),
  sexe: z.enum(['M', 'F'], {
    message: 'Sexe doit être M ou F',
  }),
  actif: z.boolean().optional().default(true),
})

// Validation pour PATCH élève (tous les champs optionnels)
export const eleveUpdateSchema = eleveSchema.partial().refine(
  (data) => data.nom || data.prenom || data.niveau || data.sexe || data.actif !== undefined,
  { message: 'Au moins un champ doit être fourni pour la modification' }
)

// Validation d'un utilisateur (AED, CPE, Manager, Superadmin)
export const aedSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .optional(),
  nom: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  prenom: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
  niveau: z.enum(niveauxValides, {
    message: 'Niveau invalide',
  }).optional(),
  sexeGroupe: z.enum(['M', 'F'], {
    message: 'Sexe du groupe doit être M ou F',
  }).optional(),
  role: z.enum(rolesValides).optional().default('aed'),
})

// Validation pour PATCH utilisateur (tous les champs optionnels sauf validations)
export const aedUpdateSchema = aedSchema.partial().refine(
  (data) => data.email || data.nom || data.prenom || data.password || data.role || data.niveau || data.sexeGroupe,
  { message: 'Au moins un champ doit être fourni pour la modification' }
)

// Validation d'un appel individuel
export const appelIndividuelSchema = z.object({
  eleveId: z.string().uuid('ID élève invalide'),
  statut: z.enum(statutsValides, {
    message: 'Statut doit être present, acf ou absent',
  }),
  observation: z
    .string()
    .max(500, "L'observation ne peut pas dépasser 500 caractères")
    .optional()
    .nullable(),
})

// Validation d'une sauvegarde d'appel complète
export const appelCompletSchema = z.object({
  aedId: z.string().uuid('ID AED invalide'),
  niveau: z.enum(niveauxValides, {
    message: 'Niveau invalide',
  }),
  appels: z
    .array(appelIndividuelSchema)
    .min(1, 'Au moins un appel est requis')
    .max(100, 'Maximum 100 appels par soumission'),
})

/**
 * Helper pour valider et retourner une erreur formatée
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      return {
        success: false,
        error: `${firstError.path.join('.')}: ${firstError.message}`,
      }
    }
    return { success: false, error: 'Données invalides' }
  }
}
