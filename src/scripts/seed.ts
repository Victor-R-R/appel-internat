// Script pour remplir la base avec des données de test
import { prisma } from '../lib/prisma'
import { hashPassword } from '../lib/auth'

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Créer le superadmin
  const adminPassword = await hashPassword('admin123')
  await prisma.user.upsert({
    where: { email: 'admin@internat.fr' },
    update: {},
    create: {
      email: 'admin@internat.fr',
      password: adminPassword,
      nom: 'Admin',
      prenom: 'Super',
      role: 'superadmin',
      niveau: null, // Superadmin n'a pas de niveau (accès à tous)
    },
  })
  console.log('✅ Superadmin créé : admin@internat.fr (password: admin123)')

  // 2. Créer des AED de test pour chaque niveau
  const aeds = [
    { email: 'aed.6eme@internat.fr', nom: 'Dupont', prenom: 'Marie', niveau: '6eme', role: 'aed' },
    { email: 'aed.5eme@internat.fr', nom: 'Martin', prenom: 'Jean', niveau: '5eme', role: 'aed' },
    { email: 'aed.term@internat.fr', nom: 'Bernard', prenom: 'Sophie', niveau: 'Term', role: 'aed' },
  ]

  const aedPassword = await hashPassword('password123')

  for (const aed of aeds) {
    await prisma.user.upsert({
      where: { email: aed.email },
      update: {},
      create: {
        ...aed,
        password: aedPassword,
      },
    })
    console.log(`✅ AED créé : ${aed.email} (password: password123)`)
  }

  // Créer des élèves de test pour la 6ème
  const eleves = [
    { nom: 'Leblanc', prenom: 'Lucas', niveau: '6eme', sexe: 'M' },
    { nom: 'Petit', prenom: 'Emma', niveau: '6eme', sexe: 'F' },
    { nom: 'Durand', prenom: 'Hugo', niveau: '6eme', sexe: 'M' },
    { nom: 'Moreau', prenom: 'Léa', niveau: '6eme', sexe: 'F' },
    { nom: 'Simon', prenom: 'Tom', niveau: '6eme', sexe: 'M' },
  ]

  for (const eleve of eleves) {
    await prisma.eleve.upsert({
      where: { id: `${eleve.nom}-${eleve.prenom}` }, // Fake ID pour éviter doublons
      update: {},
      create: eleve,
    })
  }
  console.log(`✅ ${eleves.length} élèves créés pour la 6ème`)

  console.log('✨ Seeding terminé !')
}

main()
  .catch((e) => {
    console.error('❌ Erreur seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
