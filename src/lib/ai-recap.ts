// Génération de récaps avec OpenAI (ChatGPT) ou Claude
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

// Initialiser les clients selon les clés disponibles
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

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
 * Génère un récap intelligent avec IA (OpenAI prioritaire, puis Claude, puis fallback)
 * à partir des observations de la nuit
 */
export async function genererRecapAvecIA(
  observations: ObservationData[],
  date: Date
): Promise<string> {
  // Préparer le prompt
  const prompt = construirePrompt(observations, date)

  try {
    // Priorité 1 : OpenAI (ChatGPT)
    if (openai) {
      console.log('[IA] Utilisation de OpenAI GPT-4o')
      return await genererAvecOpenAI(prompt)
    }

    // Priorité 2 : Claude
    if (anthropic) {
      console.log('[IA] Utilisation de Claude 3.5 Sonnet')
      return await genererAvecClaude(prompt)
    }

    // Priorité 3 : Fallback sans IA
    console.log('[IA] Aucune clé API configurée, utilisation du fallback')
    return genererRecapBasique(observations, date)
  } catch (error) {
    console.error('[IA] Erreur génération:', error)
    console.log('[IA] Utilisation du fallback')
    return genererRecapBasique(observations, date)
  }
}

/**
 * Construit le prompt pour l'IA
 */
function construirePrompt(observations: ObservationData[], date: Date): string {
  const observationsParNiveau: Record<string, ObservationData[]> = {}

  observations.forEach((obs) => {
    if (!observationsParNiveau[obs.niveau]) {
      observationsParNiveau[obs.niveau] = []
    }
    observationsParNiveau[obs.niveau].push(obs)
  })

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

  return `Tu es un assistant de vie scolaire dans un internat. Tu dois générer un récapitulatif professionnel et concis des observations de la nuit du ${dateStr}.

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
}

/**
 * Génération avec OpenAI (GPT-4o)
 */
async function genererAvecOpenAI(prompt: string): Promise<string> {
  if (!openai) throw new Error('OpenAI non initialisé')

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'Tu es un assistant de vie scolaire professionnel. Tu génères des récapitulatifs clairs, concis et structurés.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 1024,
    temperature: 0.7,
  })

  const contenu = completion.choices[0]?.message?.content
  if (!contenu) {
    throw new Error('Réponse vide de OpenAI')
  }

  return contenu
}

/**
 * Génération avec Claude (Anthropic)
 */
async function genererAvecClaude(prompt: string): Promise<string> {
  if (!anthropic) throw new Error('Claude non initialisé')

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
}

/**
 * Fallback : génération simple sans IA
 */
function genererRecapBasique(observations: ObservationData[], date: Date): string {
  const observationsParNiveau: Record<string, ObservationData[]> = {}

  observations.forEach((obs) => {
    if (!observationsParNiveau[obs.niveau]) {
      observationsParNiveau[obs.niveau] = []
    }
    observationsParNiveau[obs.niveau].push(obs)
  })

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
