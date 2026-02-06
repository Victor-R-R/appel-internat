/**
 * Format - Fonctions utilitaires pour le formatage de données
 */

/**
 * Formate une date en format français lisible
 * @example formatDateFR(new Date('2024-01-15')) => "15 janvier 2024"
 */
export function formatDateFR(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Formate une date pour l'API (YYYY-MM-DD)
 * @example formatDateForAPI(new Date('2024-01-15T10:30:00')) => "2024-01-15"
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}
