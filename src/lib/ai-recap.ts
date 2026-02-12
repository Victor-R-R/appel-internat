// Génération de récaps avec OpenAI (ChatGPT) ou Claude
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { NIVEAUX } from './constants'

// Initialiser les clients selon les clés disponibles
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

type ObservationData = {
  niveau: string
  sexeGroupe: string
  observation: string
}

type AbsencesParGroupe = Record<string, Array<{ nom: string; prenom: string }>>

/**
 * Génère un récap intelligent avec IA (OpenAI prioritaire, puis Claude, puis fallback)
 * à partir des observations de la nuit et des absences
 */
export async function genererRecapAvecIA(
  observations: ObservationData[],
  absences: AbsencesParGroupe,
  date: Date
): Promise<string> {
  // Préparer le prompt
  const prompt = construirePrompt(observations, absences, date)

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
    return genererRecapBasique(observations, absences, date)
  } catch (error) {
    console.error('[IA] Erreur génération:', error)
    console.log('[IA] Utilisation du fallback')
    return genererRecapBasique(observations, absences, date)
  }
}

/**
 * Construit le prompt pour l'IA
 */
function construirePrompt(observations: ObservationData[], absences: AbsencesParGroupe, date: Date): string {
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

  const niveaux = NIVEAUX

  let observationsTexte = ''
  niveaux.forEach((niveau) => {
    const obs = observationsParNiveau[niveau]
    if (obs && obs.length > 0) {
      observationsTexte += `\n## ${niveau.toUpperCase()} (${obs.length} groupe(s))\n`
      obs.forEach((o) => {
        const groupeLabel = o.sexeGroupe === 'M' ? 'Garçons' : 'Filles'
        const key = `${niveau}-${o.sexeGroupe}`
        const absencesGroupe = absences[key] || []

        observationsTexte += `🔹 ${groupeLabel}: ${o.observation}\n`

        if (absencesGroupe.length > 0) {
          observationsTexte += `   ⚠️ Absents (${absencesGroupe.length}): ${absencesGroupe.map(a => `${a.prenom} ${a.nom}`).join(', ')}\n`
        }
      })
    }
  })

  return `Tu es un assistant de vie scolaire dans un internat. Tu dois générer un récapitulatif professionnel et concis des observations de la nuit du ${dateStr}.

Voici toutes les observations par niveau et par groupe (garçons/filles), avec les absences :
${observationsTexte}

IMPORTANT : Quand une observation indique "RAS" (Rien À Signaler), cela signifie que tout s'est bien passé pour ce groupe. Mentionne-le brièvement et positivement.

Génère un récapitulatif structuré qui :
1. Commence par un résumé général (1-2 phrases max) incluant le nombre total d'absents s'il y en a
2. Organise ensuite par niveau (6ème, 5ème, 4ème, 3ème, 2nde, 1ère, Terminale)
3. Pour chaque niveau :
   - Résume les observations des groupes (garçons et filles) de manière concise
   - Pour les groupes "RAS", mentionne simplement "nuit calme" ou "aucun incident"
   - Liste les absents s'il y en a
4. Utilise des emojis pour la lisibilité (🟢 pour RAS, ⚠️ pour absences)
5. Mets en avant les situations nécessitant une attention particulière

Format attendu :
📊 Récapitulatif - [résumé global en 1-2 phrases]

[Pour chaque niveau avec données :]
🎓 [NIVEAU] ([X] groupe(s))
• [Groupe] : [Résumé concis]
  [Si absents : ⚠️ Absents (X): noms]

✅ Points positifs : [groupes RAS si pertinent]
⚠️ Points d'attention : [absences et incidents s'il y en a]

Reste factuel, professionnel et concis. Maximum 350 mots.`
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
function genererRecapBasique(observations: ObservationData[], absences: AbsencesParGroupe, date: Date): string {
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
  const totalAbsences = Object.values(absences).reduce((sum, abs) => sum + abs.length, 0)

  sections.push(`📊 Récapitulatif de la nuit du ${dateStr} - ${totalObs} groupe(s)`)
  if (totalAbsences > 0) {
    sections.push(`⚠️ ${totalAbsences} absence(s) enregistrée(s)\n`)
  } else {
    sections.push('')
  }

  const niveaux = NIVEAUX

  niveaux.forEach((niveau) => {
    const obs = observationsParNiveau[niveau]
    if (!obs || obs.length === 0) return

    sections.push(`\n🎓 ${niveau.toUpperCase()} (${obs.length} groupe(s))`)

    obs.forEach((o) => {
      const groupeLabel = o.sexeGroupe === 'M' ? '🔵 Garçons' : '🟣 Filles'
      const key = `${niveau}-${o.sexeGroupe}`
      const absencesGroupe = absences[key] || []

      sections.push(`  ${groupeLabel}:`)

      if (o.observation === 'RAS') {
        sections.push(`    🟢 Rien à signaler - nuit calme`)
      } else {
        sections.push(`    ${o.observation}`)
      }

      if (absencesGroupe.length > 0) {
        sections.push(`    ⚠️ Absents (${absencesGroupe.length}): ${absencesGroupe.map(a => `${a.prenom} ${a.nom}`).join(', ')}`)
      }
    })
  })

  return sections.join('\n')
}
