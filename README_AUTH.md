# 🔐 Guide d'authentification - Appel Internat

## 📋 Table des matières

- [Connexion locale (développement)](#-connexion-locale-développement)
- [Connexion Vercel (production)](#-connexion-vercel-production)
- [Architecture du système](#️-architecture-du-système)
- [Sécurité](#-sécurité)
- [Dépannage](#-dépannage)

---

## 🏠 Connexion locale (développement)

### Installation rapide

```bash
# Utilise le script automatique
./scripts/setup-local.sh
```

Ou manuellement :

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

### Utilisateurs de test

| Rôle | Email | Password | Accès |
|------|-------|----------|-------|
| **Superadmin** | `admin@internat.fr` | `admin123` | Tout |
| AED 6ème | `aed.6eme@internat.fr` | `password123` | Appels 6ème |
| AED 5ème | `aed.5eme@internat.fr` | `password123` | Appels 5ème |
| AED Term | `aed.term@internat.fr` | `password123` | Appels Term |

### Visualiser la base de données

```bash
npx prisma studio
# Ouvre http://localhost:5555
```

➡️ **[Guide complet : CONNEXION_LOCAL.md](./CONNEXION_LOCAL.md)**

---

## ☁️ Connexion Vercel (production)

### Prérequis

1. Compte Vercel (gratuit)
2. Projet Supabase PostgreSQL
3. Variables d'environnement configurées

### Déploiement en 3 étapes

#### 1️⃣ Configurer Supabase

```bash
# Récupère l'URL de connexion depuis Supabase Dashboard
# Settings → Database → Connection String (Transaction mode)
```

Format requis :
```
postgresql://postgres.[REF]:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true&connection_limit=1
```

#### 2️⃣ Configurer les variables Vercel

Dans **Vercel Dashboard → Settings → Environment Variables** :

| Variable | Valeur | Obligatoire |
|----------|--------|-------------|
| `DATABASE_URL` | URL PostgreSQL complète | ✅ |
| `JWT_SECRET` | Secret fort (32 chars min) | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase | ✅ |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Clé publique Supabase | ✅ |
| `OPENAI_API_KEY` | Clé OpenAI | ⚠️ Optionnel |

**Générer un JWT_SECRET sécurisé :**
```bash
openssl rand -base64 32
```

#### 3️⃣ Créer le premier admin

**Méthode A : Via script (recommandé)**
```bash
./scripts/create-first-admin.sh
```

**Méthode B : Via SQL Editor Supabase**
```sql
INSERT INTO "User" (id, email, password, nom, prenom, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@internat.fr',
  '$2a$10$8K1p3YxPzqvbL6CvKQO.4OJ6m3qL5R7nF9kP8tW2vU6mH4sE0wY1e', -- hash de "admin123"
  'Admin',
  'Super',
  'superadmin',
  NOW(),
  NOW()
);
```

**Méthode C : Via API endpoint**
```bash
curl -X POST https://ton-projet.vercel.app/api/setup/first-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@internat.fr",
    "password": "admin123",
    "nom": "Admin",
    "prenom": "Super"
  }'
```

⚠️ **Ensuite SUPPRIME l'endpoint :**
```bash
rm src/app/api/setup/first-admin/route.ts
git add . && git commit -m "security: remove setup endpoint" && git push
```

➡️ **[Guide complet : DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)**

---

## 🏗️ Architecture du système

### Flow d'authentification

```
┌─────────────┐
│   Navigateur│
└──────┬──────┘
       │ POST /api/auth/login
       │ { email, password }
       ▼
┌──────────────────────────┐
│  API Route Handler       │
│  src/app/api/auth/login/ │
└──────────┬───────────────┘
           │
           ├─► Rate limiting (5 tentatives / 15min)
           ├─► Validation Zod
           ├─► Recherche user (Prisma)
           ├─► Vérification bcrypt
           └─► Création JWT token
               │
               ▼
       ┌──────────────┐
       │  Cookie      │ HttpOnly, Secure (prod), SameSite=Lax
       │ "auth-token" │ Durée: 7 jours
       └──────────────┘
               │
               ▼
       ┌──────────────────┐
       │   Middleware     │ Vérifie JWT avant chaque requête
       │  middleware.ts   │ Protège routes admin + appel
       └──────────────────┘
```

### Différences Local vs Production

| Aspect | Local | Production (Vercel) |
|--------|-------|---------------------|
| **Base de données** | SQLite `dev.db` | PostgreSQL (Supabase) |
| **DATABASE_URL** | `file:./prisma/dev.db` | `postgresql://...` |
| **JWT_SECRET** | Dev secret (weak ok) | Fort (32+ chars) |
| **Cookie secure** | `false` (HTTP) | `true` (HTTPS requis) |
| **NODE_ENV** | `development` | `production` |
| **Utilisateurs** | Via `npm run seed` | Via SQL ou API |

---

## 🔒 Sécurité

### ✅ Bonnes pratiques implémentées

- **JWT stocké en cookie HttpOnly** → Pas accessible via JavaScript (XSS protection)
- **Cookie Secure en prod** → Transmis uniquement via HTTPS
- **SameSite=Lax** → Protection CSRF
- **Mots de passe hashés bcrypt** → 10 rounds, irréversible
- **Rate limiting** → 5 tentatives par IP / 15 minutes
- **Validation Zod** → Sanitisation des inputs
- **Middleware protecteur** → Vérification JWT sur toutes les routes sensibles

### ⚠️ Actions post-déploiement

- [ ] Changer le mot de passe admin par défaut
- [ ] Supprimer `/api/setup/first-admin` après utilisation
- [ ] Générer un `JWT_SECRET` unique par environnement
- [ ] Activer 2FA sur Vercel et Supabase
- [ ] Configurer les alertes Vercel (erreurs 5xx)
- [ ] Backup régulier de la base Supabase
- [ ] Rotation des secrets tous les 90 jours

### 🚨 Signaux d'alerte sécurité

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| "JWT verification failed" en masse | Secret changé ou leak | Régénérer JWT_SECRET + invalider sessions |
| Rate limiting constant | Attaque brute force | Bloquer IP, audit logs |
| Connexions depuis IPs inconnues | Credentials compromis | Forcer reset password |

---

## 🐛 Dépannage

### ❌ Impossible de se connecter en local

**Erreur : "Email ou mot de passe incorrect"**

```bash
# Vérifier que les users existent
npx prisma studio
# Vérifier table "User"

# Si vide, re-seed
npm run seed
```

**Erreur : "Cannot find module '@prisma/client'"**

```bash
npx prisma generate
```

**Erreur : "Database not found"**

```bash
npx prisma migrate dev
npm run seed
```

---

### ❌ Impossible de se connecter sur Vercel

**Erreur 401 : "Non authentifié"**

1. Vérifie que `DATABASE_URL` est configuré dans Vercel
2. Vérifie que `JWT_SECRET` existe
3. Check les logs : `vercel logs --prod`

**Erreur : "Too many connections"**

Ajoute à `DATABASE_URL` :
```
?pgbouncer=true&connection_limit=1
```

**Page blanche après login**

1. Ouvre la console navigateur (F12)
2. Check l'onglet Network → voir la réponse de `/api/auth/login`
3. Vérifie que le cookie `auth-token` est bien créé
4. Vérifie les logs Vercel pour stack trace

**Cookie non persistant**

- En production : vérifie que `NODE_ENV=production` (automatique sur Vercel)
- En local : assure-toi que `secure: false` en dev (déjà fait dans le code)

---

### ❌ Base de données vide sur Vercel

**Aucun utilisateur dans Supabase**

```bash
# Option 1 : Via script
./scripts/create-first-admin.sh

# Option 2 : Via Supabase SQL Editor
# Copie le SQL depuis DEPLOY_VERCEL.md

# Option 3 : Via API
curl -X POST https://ton-projet.vercel.app/api/setup/first-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@internat.fr","password":"VotreMotDePasse123"}'
```

**Schéma Prisma non appliqué**

```bash
# Depuis ton ordinateur, avec DATABASE_URL de production
DATABASE_URL="postgresql://..." npx prisma db push
```

---

### ❌ JWT_SECRET problème

**Erreur : "JWT verification failed"**

1. **Local** : Vérifie que `.env` contient `JWT_SECRET`
2. **Vercel** : Dashboard → Settings → Environment Variables → Vérifie `JWT_SECRET`
3. Si changé récemment : Les anciens tokens sont invalides (normal)

**Générer un nouveau secret :**

```bash
# Mac/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## 📚 Fichiers de référence

- **[CONNEXION_LOCAL.md](./CONNEXION_LOCAL.md)** : Guide détaillé connexion locale
- **[DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)** : Guide déploiement Vercel complet
- **[.env.example](./.env.example)** : Template variables d'environnement
- **[scripts/setup-local.sh](./scripts/setup-local.sh)** : Setup automatique local
- **[scripts/create-first-admin.sh](./scripts/create-first-admin.sh)** : Création admin prod

---

## 🆘 Support

### Vérifier les logs

**Local :**
```bash
npm run dev
# Logs dans le terminal
```

**Vercel :**
```bash
vercel logs --prod

# Ou via dashboard :
# vercel.com → Ton projet → Deployments → Latest → Logs
```

**Supabase :**
```bash
# Dashboard Supabase → Logs → Postgres Logs
```

### Réinitialisation complète (dernier recours)

**Local :**
```bash
rm -rf node_modules prisma/dev.db prisma/dev.db-journal
npm install
./scripts/setup-local.sh
```

**Production :**
1. Sauvegarde les données Supabase (Export → CSV)
2. Supprime toutes les tables
3. Re-run : `DATABASE_URL="..." npx prisma db push`
4. Re-crée admin : `./scripts/create-first-admin.sh`
5. Réimporte les données sauvegardées

---

## 🎯 Checklist de déploiement

### Avant de déployer

- [ ] `.env` est dans `.gitignore`
- [ ] `JWT_SECRET` est fort (32+ chars)
- [ ] Supabase PostgreSQL est configuré
- [ ] Variables d'environnement définies dans Vercel
- [ ] Schéma Prisma poussé vers Supabase
- [ ] Code commit + push sur `main`

### Après le déploiement

- [ ] Vérifier que l'app Vercel démarre sans erreur
- [ ] Créer le premier admin
- [ ] Tester la connexion sur `/login`
- [ ] Vérifier accès `/admin/dashboard`
- [ ] Supprimer `/api/setup/first-admin`
- [ ] Changer le mot de passe admin par défaut
- [ ] Activer 2FA Vercel et Supabase
- [ ] Configurer alertes monitoring

---

**Last updated:** 2026-02-05
**Version:** 0.3.18
