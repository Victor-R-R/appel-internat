# 🚀 Déploiement Vercel - Guide complet

## 📋 Prérequis

- [x] Compte Vercel (gratuit)
- [x] Compte Supabase (gratuit)
- [x] Projet GitHub/GitLab connecté à Vercel

---

## 🗄️ Étape 1 : Configuration PostgreSQL (Supabase)

### 1.1 Créer le projet Supabase
1. Va sur [supabase.com](https://supabase.com)
2. Crée un nouveau projet
3. Note le **mot de passe** de la base (tu ne le reverras pas !)

### 1.2 Récupérer l'URL de connexion
1. Dans le dashboard Supabase → **Settings** → **Database**
2. Copie la **Connection String** en mode **Transaction** :
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```
3. **Remplace `[PASSWORD]`** par le mot de passe noté à l'étape 1.1

### 1.3 Optimiser pour Vercel (Serverless)
Ajoute ces paramètres à la fin de l'URL :
```
?pgbouncer=true&connection_limit=1
```

URL finale :
```
postgresql://postgres.PROJECT:PASSWORD@HOST:6543/postgres?pgbouncer=true&connection_limit=1
```

---

## 🔐 Étape 2 : Générer un JWT Secret sécurisé

**Sur Mac/Linux :**
```bash
openssl rand -base64 32
```

**Sur Windows (PowerShell) :**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Exemple de résultat :
```
7Kx9Qp2vN8mR3tY6wZ5aB1cD4eF8gH0i
```

⚠️ **Sauvegarde ce secret en lieu sûr !**

---

## ⚙️ Étape 3 : Configuration des variables d'environnement Vercel

### 3.1 Via le dashboard Vercel
1. Va sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionne ton projet → **Settings** → **Environment Variables**
3. Ajoute ces variables **une par une** :

| Variable | Valeur | Environnement |
|----------|--------|---------------|
| `DATABASE_URL` | `postgresql://...` (étape 1.3) | Production |
| `JWT_SECRET` | Secret généré (étape 2) | Production |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` | Production |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Clé depuis Supabase Settings → API | Production |
| `OPENAI_API_KEY` | Ta clé OpenAI (optionnel) | Production |

### 3.2 Via Vercel CLI (alternative)
```bash
vercel env add DATABASE_URL production
# Colle l'URL PostgreSQL complète

vercel env add JWT_SECRET production
# Colle le secret généré

# Répète pour les autres variables...
```

---

## 🛠️ Étape 4 : Initialiser la base de données Supabase

### 4.1 Pousser le schéma Prisma
```bash
# Utilise l'URL PostgreSQL de production
npx prisma db push --schema=./prisma/schema.prisma
```

### 4.2 Créer le premier utilisateur admin

**Option A : Via script seed modifié**
```bash
DATABASE_URL="postgresql://..." npm run seed
```

**Option B : Via Supabase SQL Editor**
1. Va dans Supabase → **SQL Editor**
2. Exécute ce script :
```sql
-- Hash de "admin123" (généré avec bcryptjs, 10 rounds)
INSERT INTO "User" (id, email, password, nom, prenom, role, niveau, "sexeGroupe", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@internat.fr',
  '$2a$10$8K1p3YxPzqvbL6CvKQO.4OJ6m3qL5R7nF9kP8tW2vU6mH4sE0wY1e',
  'Admin',
  'Super',
  'superadmin',
  NULL,
  NULL,
  NOW(),
  NOW()
);
```

**Option C : Créer via API après déploiement**
```bash
# Endpoint à créer : POST /api/auth/register-first-admin
# (temporairement actif uniquement si aucun admin existe)
```

---

## 🚀 Étape 5 : Déployer sur Vercel

### 5.1 Via Git (recommandé)
```bash
git add .
git commit -m "chore: configure pour Vercel production"
git push origin main
```

Vercel détecte automatiquement le push et déploie.

### 5.2 Via CLI Vercel
```bash
vercel --prod
```

---

## ✅ Étape 6 : Vérifier le déploiement

### 6.1 Tester la connexion
1. Va sur `https://ton-projet.vercel.app/login`
2. Connecte-toi avec :
   ```
   Email: admin@internat.fr
   Password: admin123
   ```

### 6.2 Vérifier les logs
```bash
vercel logs --prod
```

Ou dans le dashboard Vercel → **Deployments** → Dernier déploiement → **Logs**

---

## 🔧 Étape 7 : Créer un endpoint de setup initial (optionnel)

Pour éviter de manipuler la DB directement, crée un endpoint sécurisé :

**`src/app/api/setup/first-admin/route.ts`**
```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    // Vérifier si un admin existe déjà
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'superadmin' }
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Un admin existe déjà' },
        { status: 403 }
      )
    }

    // Créer le premier admin
    const { email, password } = await request.json()
    const hashedPassword = await hashPassword(password)

    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nom: 'Admin',
        prenom: 'Premier',
        role: 'superadmin',
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Premier admin créé avec succès'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    )
  }
}
```

Utilisation :
```bash
curl -X POST https://ton-projet.vercel.app/api/setup/first-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@internat.fr","password":"admin123"}'
```

**⚠️ Supprime cet endpoint après l'avoir utilisé !**

---

## 📊 Récapitulatif des différences Local vs Production

| Aspect | Local (Dev) | Vercel (Prod) |
|--------|-------------|---------------|
| **Base de données** | SQLite (`./prisma/dev.db`) | PostgreSQL (Supabase) |
| **DATABASE_URL** | `file:./prisma/dev.db` | `postgresql://...` |
| **JWT_SECRET** | Secret dev (non critique) | Secret fort (critique) |
| **NODE_ENV** | `development` | `production` |
| **Cookies secure** | `false` (HTTP ok) | `true` (HTTPS requis) |
| **Seed** | `npm run seed` | Via SQL Editor ou API |

---

## 🐛 Dépannage

### Erreur : "PrismaClientInitializationError"
→ Vérifie que `DATABASE_URL` est bien configuré dans Vercel

### Erreur : "JWT verification failed"
→ Vérifie que `JWT_SECRET` est identique entre les déploiements

### Erreur : "Too many connections"
→ Ajoute `?pgbouncer=true&connection_limit=1` à `DATABASE_URL`

### Page blanche après login
→ Vérifie les logs Vercel : probablement une erreur de cookie `secure`

### Impossible de se connecter
→ Vérifie que le user admin existe dans Supabase → Table Editor → User

---

## 🔒 Sécurité post-déploiement

- [ ] Change le mot de passe admin par défaut
- [ ] Supprime l'endpoint `/api/setup/first-admin` si créé
- [ ] Active l'authentification 2FA sur Vercel et Supabase
- [ ] Configure les CORS si nécessaire
- [ ] Active les alertes Vercel pour les erreurs 5xx
- [ ] Backup régulier de la base Supabase

---

## 📚 Ressources

- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Supabase Database Settings](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
