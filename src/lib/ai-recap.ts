// Génération de récaps avec l'API Claude
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

type ObservationData = {
  niveau: string
  eleve: {
    nom: string
    prenom: string
    sexe: string
  }
  statut: string
  observation: string
}

/**
 * Génère un récap intelligent avec Claude
 * à partir des observations de la nuit
 */
export async function genererRecapAvecIA(
  observations: ObservationData[],
  date: Date
): Promise<string> {
  // Formater les données pour Claude
  const observationsParNiveau: Record<string, ObservationData[]> = {}

  observations.forEach((obs) => {
    if (!observationsParNiveau[obs.niveau]) {
      observationsParNiveau[obs.niveau] = []
    }
    observationsParNiveau[obs.niveau].push(obs)
  })

  // Construire le prompt
  const dateStr = date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const niveaux = ['6eme', '5eme', '4eme', '3eme', '2nde', '1ere', 'Term']

  let observationsTexte = ''
  niveaux.forEach((niveau) => {
    const obs = observationsParNiveau[niveau]
    if (obs && obs.length > 0) {
      observationsTexte += `\n## ${niveau.toUpperCase()} (${obs.length} observation(s))\n`
      obs.forEach((o) => {
        const nom = `${o.eleve.prenom} ${o.eleve.nom}`
        const statutEmoji = o.statut === 'absent' ? '🔴' : o.statut === 'acf' ? '🟠' : '🟢'
        observationsTexte += `${statutEmoji} ${nom} (${o.statut}): ${o.observation}\n`
      })
    }
  })

  const prompt = `Tu es un assistant de vie scolaire dans un internat. Tu dois générer un récapitulatif professionnel et concis des observations de la nuit du ${dateStr}.

Voici toutes les observations par niveau :
${observationsTexte}

Génère un récapitulatif structuré qui :
1. Commence par un résumé général (1-2 phrases max)
2. Organise ensuite par niveau (6ème, 5ème, 4ème, 3ème, 2nde, 1ère, Terminale)
3. Pour chaque niveau, résume les points importants de manière concise
4. Utilise des emojis pour la lisibilité : 🔴 Absents, 🟠 ACF, 🟢 Présents avec remarques
5. Mets en avant les situations nécessitant une attention particulière

Format attendu :
📊 Récapitulatif - [résumé global en 1-2 phrases]

[Pour chaque niveau avec observations :]
🎓 [NIVEAU] ([X] observation(s))
[Résumé concis des points clés]

⚠️ Points d'attention : [s'il y en a]

Reste factuel, professionnel et concis. Maximum 300 mots.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const contenu = message.content[0]
    if (contenu.type === 'text') {
      return contenu.text
    }

    throw new Error('Réponse invalide de Claude')
  } catch (error) {
    console.error('Erreur génération IA:', error)

    // Fallback : génération basique sans IA
    return genererRecapBasique(observationsParNiveau, date)
  }
}

/**
 * Fallback : génération simple sans IA
 */
function genererRecapBasique(
  observationsParNiveau: Record<string, ObservationData[]>,
  date: Date
): string {
  const sections: string[] = []
  const dateStr = date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const totalObs = Object.values(observationsParNiveau).reduce((sum, obs) => sum + obs.length, 0)
  sections.push(`📊 Récapitulatif de la nuit du ${dateStr} - ${totalObs} observation(s)\n`)

  const niveaux = ['6eme', '5eme', '4eme', '3eme', '2nde', '1ere', 'Term']

  niveaux.forEach((niveau) => {
    const obs = observationsParNiveau[niveau]
    if (!obs || obs.length === 0) return

    sections.push(`\n🎓 ${niveau.toUpperCase()} (${obs.length} observation(s))`)

    const parStatut: Record<string, ObservationData[]> = {
      absent: [],
      acf: [],
      present: [],
    }

    obs.forEach((o) => {
      if (parStatut[o.statut]) {
        parStatut[o.statut].push(o)
      }
    })

    if (parStatut.absent.length > 0) {
      sections.push(`  🔴 Absents (${parStatut.absent.length})`)
      parStatut.absent.forEach((o) => {
        sections.push(`    • ${o.eleve.prenom} ${o.eleve.nom}: ${o.observation}`)
      })
    }

    if (parStatut.acf.length > 0) {
      sections.push(`  🟠 ACF (${parStatut.acf.length})`)
      parStatut.acf.forEach((o) => {
        sections.push(`    • ${o.eleve.prenom} ${o.eleve.nom}: ${o.observation}`)
      })
    }

    if (parStatut.present.length > 0) {
      sections.push(`  🟢 Présents - Remarques (${parStatut.present.length})`)
      parStatut.present.forEach((o) => {
        sections.push(`    • ${o.eleve.prenom} ${o.eleve.nom}: ${o.observation}`)
      })
    }
  })

  return sections.join('\n')
}
