// Utilitaires pour l'authentification
import bcrypt from 'bcryptjs'

/**
 * Hash un mot de passe avec bcrypt
 * Le "10" = nombre de rounds de hashing (sécurité vs performance)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * Vérifie si un mot de passe correspond au hash
 * Utilisé lors du login
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}
