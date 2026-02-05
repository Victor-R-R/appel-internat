/**
 * Script de génération de données de test
 * Crée 20 élèves par niveau et par sexe + AED correspondants
 */

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Niveaux scolaires
const niveaux = ['6eme', '5eme', '4eme', '3eme', '2nde', '1ere', 'Term'] as const

// Prénoms français
const prenomsGarcons = [
  'Louis', 'Lucas', 'Léo', 'Raphaël', 'Arthur', 'Nathan', 'Hugo', 'Tom',
  'Ethan', 'Noah', 'Jules', 'Gabriel', 'Adam', 'Antoine', 'Paul', 'Victor',
  'Maxime', 'Alexandre', 'Théo', 'Robin', 'Mathis', 'Enzo', 'Clément', 'Thomas'
]

const prenomsFilles = [
  'Emma', 'Louise', 'Chloé', 'Alice', 'Léa', 'Manon', 'Inès', 'Jade',
  'Lina', 'Zoé', 'Camille', 'Sarah', 'Léna', 'Clara', 'Juliette', 'Eva',
  'Nina', 'Rose', 'Anna', 'Lou', 'Mila', 'Sofia', 'Lily', 'Charlotte'
]

// Noms de famille français
const noms = [
  'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit',
  'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel',
  'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel',
  'Girard', 'André', 'Mercier', 'Dupont', 'Lambert', 'Bonnet', 'François',
  'Martinez', 'Legrand', 'Garnier', 'Faure', 'Rousseau', 'Blanc', 'Guerin',
  'Muller', 'Henry', 'Roussel', 'Nicolas', 'Perrin', 'Morin', 'Mathieu'
]

// Prénoms AED
const prenomsAED = {
  F: ['Sophie', 'Marie', 'Julie', 'Émilie', 'Caroline', 'Isabelle', 'Nathalie'],
  M: ['Pierre', 'Jean', 'Luc', 'Marc', 'Philippe', 'Nicolas', 'Julien']
}

const nomsAED = ['Dupuis', 'Lefevre', 'Fontaine', 'Chevalier', 'Gauthier', 'Perrot', 'Robin']

async function main() {
  console.log('🌱 Début du seed...\n')

  // 1. Créer les AED (1 par niveau et par sexe)
  console.log('👥 Création des AED...')
  const aeds = []

  for (let i = 0; i < niveaux.length; i++) {
    const niveau = niveaux[i]

    // AED Filles
    const aedFille = await prisma.user.create({
      data: {
        email: `aed.${niveau}.filles@internat.fr`,
        password: await bcrypt.hash('password123', 10),
        nom: nomsAED[i],
        prenom: prenomsAED.F[i],
        niveau,
        sexeGroupe: 'F',
        role: 'aed',
      },
    })
    aeds.push(aedFille)
    console.log(`  ✓ AED créé : ${aedFille.prenom} ${aedFille.nom} - ${niveau} Filles`)

    // AED Garçons
    const aedGarcon = await prisma.user.create({
      data: {
        email: `aed.${niveau}.garcons@internat.fr`,
        password: await bcrypt.hash('password123', 10),
        nom: nomsAED[i],
        prenom: prenomsAED.M[i],
        niveau,
        sexeGroupe: 'M',
        role: 'aed',
      },
    })
    aeds.push(aedGarcon)
    console.log(`  ✓ AED créé : ${aedGarcon.prenom} ${aedGarcon.nom} - ${niveau} Garçons`)
  }

  console.log(`\n✅ ${aeds.length} AED créés\n`)

  // 2. Créer les élèves (20 par niveau et par sexe)
  console.log('🎓 Création des élèves...')
  let totalEleves = 0

  for (const niveau of niveaux) {
    console.log(`\n  📚 Niveau ${niveau}:`)

    // 20 Garçons
    for (let i = 0; i < 20; i++) {
      const prenom = prenomsGarcons[i % prenomsGarcons.length]
      const nom = noms[(i * 3 + Math.floor(Math.random() * 10)) % noms.length]

      await prisma.eleve.create({
        data: {
          nom,
          prenom,
          niveau,
          sexe: 'M',
          actif: true,
        },
      })
      totalEleves++
    }
    console.log(`    ✓ 20 garçons créés`)

    // 20 Filles
    for (let i = 0; i < 20; i++) {
      const prenom = prenomsFilles[i % prenomsFilles.length]
      const nom = noms[(i * 5 + Math.floor(Math.random() * 10)) % noms.length]

      await prisma.eleve.create({
        data: {
          nom,
          prenom,
          niveau,
          sexe: 'F',
          actif: true,
        },
      })
      totalEleves++
    }
    console.log(`    ✓ 20 filles créées`)
  }

  console.log(`\n✅ ${totalEleves} élèves créés au total\n`)

  // 3. Résumé
  console.log('📊 Résumé:')
  console.log(`  • ${aeds.length} AED (14 = 7 niveaux × 2 sexes)`)
  console.log(`  • ${totalEleves} élèves (280 = 7 niveaux × 40 élèves)`)
  console.log(`  • Chaque niveau a 20 filles + 20 garçons`)
  console.log(`  • Chaque niveau a 1 AED Filles + 1 AED Garçons`)

  console.log('\n🎉 Seed terminé avec succès!\n')
  console.log('📝 Informations de connexion AED:')
  console.log('   Email: aed.[niveau].[filles|garcons]@internat.fr')
  console.log('   Password: password123')
  console.log('   Exemple: aed.6eme.filles@internat.fr')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
