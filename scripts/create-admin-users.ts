/**
 * Script pour créer des utilisateurs CPE et Manager
 * Usage: npx tsx scripts/create-admin-users.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const adminUsers = [
  // 3 CPE
  {
    email: 'cpe1@internat.fr',
    password: 'ChangeMe2024!',
    nom: 'Dupont',
    prenom: 'Marie',
    role: 'cpe' as const,
  },
  {
    email: 'cpe2@internat.fr',
    password: 'ChangeMe2024!',
    nom: 'Martin',
    prenom: 'Jean',
    role: 'cpe' as const,
  },
  {
    email: 'cpe3@internat.fr',
    password: 'ChangeMe2024!',
    nom: 'Bernard',
    prenom: 'Sophie',
    role: 'cpe' as const,
  },
  // 1 Manager
  {
    email: 'manager@internat.fr',
    password: 'ChangeMe2024!',
    nom: 'Leroy',
    prenom: 'Pierre',
    role: 'manager' as const,
  },
]

async function createAdminUsers() {
  console.log('🚀 Création des utilisateurs CPE et Manager...\n')

  for (const userData of adminUsers) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existing = await prisma.user.findUnique({
        where: { email: userData.email },
      })

      if (existing) {
        console.log(`⚠️  ${userData.email} existe déjà - ignoré`)
        continue
      }

      // Hash du mot de passe
      const hashedPassword = await bcrypt.hash(userData.password, 10)

      // Créer l'utilisateur
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          nom: userData.nom,
          prenom: userData.prenom,
          role: userData.role,
          niveau: null, // Accès à tous les niveaux
          sexeGroupe: null, // Accès à tous les groupes
        },
      })

      console.log(`✅ ${userData.role.toUpperCase()} créé: ${user.prenom} ${user.nom} (${user.email})`)
      console.log(`   Mot de passe initial: ${userData.password}`)
    } catch (error) {
      console.error(`❌ Erreur lors de la création de ${userData.email}:`, error)
    }
  }

  console.log('\n✨ Terminé!')
  console.log('\n🔐 IMPORTANT: Changez les mots de passe après la première connexion!')
  console.log('\n📊 Ces utilisateurs ont accès à:')
  console.log('   - Tous les historiques d\'appels')
  console.log('   - Toutes les statistiques')
  console.log('   - Tous les récapitulatifs')
  console.log('   - Gestion des AED et élèves')
}

createAdminUsers()
  .catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
