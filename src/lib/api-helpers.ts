/**
 * API Helpers - Fonctions utilitaires pour les routes API
 */

import { NextResponse } from 'next/server';

/**
 * Réponse JSON de succès standardisée
 */
export function apiSuccess(data: Record<string, any>, status: number = 200): NextResponse {
  return NextResponse.json(
    { success: true, ...data },
    { status }
  );
}

/**
 * Réponse JSON d'erreur standardisée
 */
export function apiError(error: string, status: number = 400): NextResponse {
  return NextResponse.json(
    { success: false, error },
    { status }
  );
}

/**
 * Gestion d'erreur serveur standardisée
 * - Log l'erreur en détail côté serveur
 * - Retourne un message générique au client (pas de fuite d'info)
 */
export function apiServerError(logMessage: string, error: unknown): NextResponse {
  console.error(`${logMessage}:`, error);
  return NextResponse.json(
    { success: false, error: 'Erreur serveur' },
    { status: 500 }
  );
}

/**
 * Normalise une date en UTC à minuit
 * Corrige les bugs de timezone en forçant l'heure à 00:00:00.000
 */
export function normalizeDate(dateParam?: string | Date): Date {
  const date = dateParam ? new Date(dateParam) : new Date();
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

/**
 * Retourne un range de dates (début de journée -> fin de journée) en UTC
 * Utilisé pour les requêtes Prisma avec filtres de date
 */
export function getDateRange(dateParam?: string | Date): { start: Date; end: Date } {
  const start = normalizeDate(dateParam);
  const end = new Date(start);
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
}
