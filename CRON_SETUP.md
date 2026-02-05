# Configuration du Cron Job pour la génération automatique des récaps

## Objectif
Générer automatiquement chaque matin à 6h un récapitulatif IA des observations de la nuit précédente.

## Prérequis

### 1. Clé API IA (OpenAI ou Anthropic)

Le système supporte deux providers d'IA :

**Option A : OpenAI (ChatGPT) - Recommandé**
- Créer une clé sur https://platform.openai.com/api-keys
- Ajouter dans `.env` :
```bash
OPENAI_API_KEY=sk-proj-...
```
- Modèle utilisé : **GPT-4o**

**Option B : Claude (Anthropic)**
- Créer une clé sur https://console.anthropic.com/
- Ajouter dans `.env` :
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```
- Modèle utilisé : **Claude 3.5 Sonnet**

> **Note** : Si les deux clés sont présentes, OpenAI est prioritaire. Sans clé, le système utilise un fallback basique (sans IA)

### 2. URL de production

Votre application doit être déployée et accessible via une URL publique.

## Configuration du Cron Job

### Option 1 : Vercel Cron (Recommandé si déployé sur Vercel)

1. Créer le fichier `vercel.json` à la racine du projet :

```json
{
  "crons": [
    {
      "path": "/api/admin/recaps/generate",
      "schedule": "0 6 * * *"
    }
  ]
}
```

2. Déployer sur Vercel - le cron sera automatiquement configuré

### Option 2 : EasyCron (Service externe gratuit)

1. Créer un compte sur https://www.easycron.com/
2. Créer un nouveau cron job :
   - **URL** : `https://votre-domaine.com/api/admin/recaps/generate`
   - **Method** : POST
   - **Schedule** : `0 6 * * *` (tous les jours à 6h)
   - **Headers** : `Content-Type: application/json`
   - **Body** : `{}`

### Option 3 : Cron système (Si auto-hébergé)

1. Éditer le crontab :
```bash
crontab -e
```

2. Ajouter la ligne :
```bash
0 6 * * * curl -X POST https://votre-domaine.com/api/admin/recaps/generate -H "Content-Type: application/json" -d '{}'
```

### Option 4 : GitHub Actions (Si code sur GitHub)

1. Créer `.github/workflows/daily-recap.yml` :

```yaml
name: Génération récap quotidien

on:
  schedule:
    - cron: '0 6 * * *'  # 6h UTC tous les jours
  workflow_dispatch:  # Permet déclenchement manuel

jobs:
  generate-recap:
    runs-on: ubuntu-latest
    steps:
      - name: Générer récap
        run: |
          curl -X POST https://votre-domaine.com/api/admin/recaps/generate \
            -H "Content-Type: application/json" \
            -d '{}'
```

## Test manuel

Pour tester la génération sans attendre le cron :

```bash
curl -X POST http://localhost:3000/api/admin/recaps/generate \
  -H "Content-Type: application/json" \
  -d '{}'
```

Ou avec une date spécifique :

```bash
curl -X POST http://localhost:3000/api/admin/recaps/generate \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-01-15"}'
```

## Format de la réponse API

### Succès
```json
{
  "success": true,
  "recap": {
    "id": "uuid",
    "date": "2024-01-15T00:00:00.000Z",
    "createdAt": "2024-01-16T06:00:00.000Z"
  },
  "observationsCount": 12
}
```

### Aucune observation
```json
{
  "success": false,
  "error": "Aucune observation trouvée pour cette date"
}
```

### Erreur
```json
{
  "success": false,
  "error": "Message d'erreur"
}
```

## Monitoring

Les logs de génération sont visibles dans la console :
- `[Génération récap] Date: ...`
- `[Génération récap] X observation(s) trouvée(s)`
- `[Génération récap] Récap créé/mis à jour`

## Coûts IA

### OpenAI (GPT-4o)
- **Tokens par récap** : ~500-1000 tokens
- **Coût estimé** : ~$0.005-0.01 par récap
- **Coût mensuel** : ~$0.15-0.30 (30 jours)

### Claude (Anthropic)
- **Tokens par récap** : ~500-1000 tokens
- **Coût estimé** : ~$0.01-0.02 par récap
- **Coût mensuel** : ~$0.30-0.60 (30 jours)

> OpenAI est environ 2x moins cher que Claude pour ce cas d'usage

Le fallback sans IA est utilisé si aucune clé API n'est configurée ou en cas d'erreur.

## Dépannage

### Le cron ne se déclenche pas
- Vérifier les logs du service cron
- Tester l'endpoint manuellement avec curl
- Vérifier que l'URL est accessible publiquement

### Le récap n'est pas généré
- Vérifier qu'il y a des observations pour la date ciblée
- Regarder les logs de l'API : `[Génération récap]`
- Vérifier la clé API Anthropic

### Erreur IA
- Le système utilise automatiquement le fallback sans IA
- Vérifier la validité de la clé API
- Vérifier les quotas Anthropic
