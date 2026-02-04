# 🏫 Appel Internat

> Système moderne de gestion d'appel pour les internats scolaires

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

## 📋 Description

**Appel Internat** est une application web moderne qui digitalise et simplifie le processus d'appel quotidien dans les internats scolaires. Fini les cahiers papier, les erreurs de recopie et les observations perdues !

### 🎯 Problème résolu

Dans les internats traditionnels :
- ❌ Cahiers papier par niveau et sexe
- ❌ Risque de perte ou détérioration
- ❌ Difficile de retrouver l'historique
- ❌ Observations manuscrites illisibles
- ❌ Pas de centralisation des données

### ✅ Solution proposée

- ✅ Interface web responsive (mobile, tablette, ordinateur)
- ✅ Authentification sécurisée par niveau
- ✅ Enregistrement instantané en base de données
- ✅ Historique complet et consultable
- ✅ Observations claires et structurées
- ✅ Dashboard administrateur centralisé
- ✅ (Bientôt) Récapitulatifs automatiques par IA

---

## ✨ Fonctionnalités

### Pour les AED (Assistants d'Éducation)
- 🔐 Connexion sécurisée par niveau
- 📋 Liste des élèves de leur niveau
- ✓ Marquage rapide : Présent / ACF / Absent
- 📝 Zone observations pour remarques détaillées
- 💾 Sauvegarde automatique en base de données
- 📊 Historique des appels précédents

### Pour les Superadmins
- 🔐 Dashboard d'administration complet
- 👥 Gestion des AED (CRUD)
- 🎓 Gestion des élèves (CRUD, archivage)
- 📈 Statistiques globales
- 📝 Accès à tous les récaps de tous les niveaux
- 🔍 Visualisation de l'historique complet

### À venir 🚀
- 🤖 Récaps automatiques générés par IA (Claude/GPT)
- 📧 Envoi automatique par email
- 📊 Analytics avancés (absences récurrentes, tendances)
- 📱 Progressive Web App (mode hors ligne)
- 📸 Photos des élèves
- 📤 Import/export CSV

---

## 🛠️ Stack Technique

### Frontend
- **[Next.js 16](https://nextjs.org/)** - Framework React avec App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Typage statique
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling utilitaire

### Backend
- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)** - API RESTful intégrée
- **[Prisma ORM](https://www.prisma.io/)** - ORM typé pour BDD
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Hashing de mots de passe

### Base de données
- **[SQLite](https://www.sqlite.org/)** - Développement (fichier local)
- **[PostgreSQL](https://www.postgresql.org/)** - Production (recommandé : Supabase, Neon)

### Déploiement
- **[Vercel](https://vercel.com/)** - Hébergement frontend (gratuit)
- **[Supabase](https://supabase.com/)** - Base de données PostgreSQL gratuite

---

## 🚀 Installation

### Prérequis
- [Node.js](https://nodejs.org/) 18+ et npm
- Git

### 1. Cloner le repo
```bash
git clone https://github.com/votre-username/appel-internat.git
cd appel-internat
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer la base de données
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Créer la base SQLite et appliquer les migrations
npx prisma migrate dev

# Générer le client Prisma
npx prisma generate
```

### 4. Créer les données de test
```bash
npm run seed
```

Cela créera :
- 1 superadmin : `admin@internat.fr` / `admin123`
- 3 AED : `aed.6eme@internat.fr`, `aed.5eme@internat.fr`, `aed.term@internat.fr` / `password123`
- 5 élèves de 6ème

### 5. Lancer le serveur de développement
```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 📖 Utilisation

### Connexion AED
1. Se connecter avec un compte AED (ex: `aed.6eme@internat.fr` / `password123`)
2. Vous êtes redirigé vers la page d'appel de votre niveau
3. Pour chaque élève :
   - Cliquer sur le statut (Présent/ACF/Absent)
   - Ajouter une observation si nécessaire
4. Cliquer sur "Enregistrer l'appel"

### Connexion Superadmin
1. Se connecter avec `admin@internat.fr` / `admin123`
2. Accès au dashboard d'administration avec :
   - Statistiques globales
   - Gestion des AED
   - Gestion des élèves
   - Tous les récaps

---

## 📁 Structure du projet

```
appel-internat/
├── prisma/
│   ├── schema.prisma      # Schéma de la base de données
│   ├── migrations/        # Historique des migrations
│   └── dev.db            # Base SQLite (dev uniquement)
├── src/
│   ├── app/
│   │   ├── api/          # API Routes (backend)
│   │   ├── admin/        # Pages administrateur
│   │   ├── appel/        # Page d'appel AED
│   │   └── login/        # Page de connexion
│   ├── lib/
│   │   ├── prisma.ts     # Client Prisma singleton
│   │   └── auth.ts       # Utilitaires auth (bcrypt)
│   └── scripts/
│       └── seed.ts       # Script de données de test
├── .env                  # Variables d'environnement (PAS COMMITÉ)
├── .env.example          # Template des variables
└── package.json          # Dépendances npm
```

---

## 🗃️ Schéma de base de données

```prisma
User (AED et Superadmin)
├── id, email, password (hashé)
├── nom, prenom
├── role: "aed" | "superadmin"
└── niveau: "6eme" | "5eme" | ... (null pour superadmin)

Eleve
├── id, nom, prenom
├── niveau, sexe
└── actif: boolean (archivage)

Appel (enregistrement quotidien)
├── id, date
├── niveau, statut: "present" | "acf" | "absent"
├── observation: texte libre
├── eleveId → Eleve
└── aedId → User

Recap (récaps générés par IA)
├── id, date, niveau
└── contenu: résumé généré
```

---

## 🔐 Sécurité

- ✅ Mots de passe hashés avec **bcrypt** (10 rounds)
- ✅ Validation des rôles côté serveur
- ✅ Variables sensibles dans `.env` (pas commité)
- ✅ Protection CSRF intégrée Next.js
- ⚠️ **Pour production** : Ajouter JWT ou NextAuth.js pour sessions sécurisées

---

## 🚀 Déploiement

### Sur Vercel (recommandé)

1. Push ton code sur GitHub
2. Importer le projet sur [Vercel](https://vercel.com)
3. Configurer les variables d'environnement :
   ```
   DATABASE_URL=postgresql://user:pass@host/db
   ```
4. Deploy !

### Base de données PostgreSQL gratuite

- **[Supabase](https://supabase.com/)** : 500 MB gratuit
- **[Neon](https://neon.tech/)** : 512 MB gratuit
- **[Railway](https://railway.app/)** : $5 crédit/mois

Modifier `DATABASE_URL` dans `.env` avec l'URL PostgreSQL.

---

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changes (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour plus de détails.

---

## 📝 Roadmap

- [x] Authentification AED/Superadmin
- [x] Page d'appel avec statuts
- [x] Sauvegarde en base de données
- [x] Dashboard administrateur
- [ ] Gestion CRUD des AED
- [ ] Gestion CRUD des élèves
- [ ] Récaps automatiques avec IA (Claude/GPT)
- [ ] Envoi email automatique
- [ ] Historique et statistiques
- [ ] Mode hors ligne (PWA)
- [ ] Import/export CSV
- [ ] Photos des élèves
- [ ] Multi-langue (FR/EN)

---

## 📄 License

Ce projet est sous licence **MIT**. Voir [LICENSE](./LICENSE) pour plus d'informations.

---

## 👤 Auteur

**Victor Rubia**

- GitHub: [@victorrubia](https://github.com/victorrubia)

---

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) pour le framework
- [Prisma](https://www.prisma.io/) pour l'ORM incroyable
- [Vercel](https://vercel.com/) pour l'hébergement gratuit
- La communauté open source ❤️

---

## 📞 Support

Si vous avez des questions ou rencontrez des problèmes :
- Ouvrir une [issue](https://github.com/votre-username/appel-internat/issues)
- Consulter la [documentation](https://github.com/votre-username/appel-internat/wiki)

---

<div align="center">
  <strong>⭐ Si ce projet vous aide, mettez-lui une étoile sur GitHub ! ⭐</strong>
</div>
