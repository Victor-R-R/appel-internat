// Client Prisma singleton pour Next.js
// Pattern recommandé : évite de créer trop de connexions en dev (hot reload)

import { PrismaClient } from '@prisma/client'

// Déclaration TypeScript pour stocker le client dans globalThis
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Si le client existe déjà (hot reload), on le réutilise
// Sinon on en crée un nouveau
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn'] // Logs SQL en dev (pratique pour apprendre)
      : ['error'], // En production, seulement les erreurs
  })

// En dev, on stocke le client dans global pour le réutiliser
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
