# 🤝 Guide de Contribution

Merci de vouloir contribuer à **Appel Internat** ! Toutes les contributions sont bienvenues, qu'il s'agisse de corrections de bugs, de nouvelles fonctionnalités ou d'améliorations de documentation.

## 📋 Table des matières

- [Code de conduite](#code-de-conduite)
- [Comment contribuer](#comment-contribuer)
- [Processus de développement](#processus-de-développement)
- [Standards de code](#standards-de-code)
- [Commits et messages](#commits-et-messages)
- [Pull Requests](#pull-requests)

---

## 🤝 Code de conduite

En participant à ce projet, vous acceptez de respecter notre code de conduite :
- Respecter tous les contributeurs
- Accepter les critiques constructives
- Être professionnel et bienveillant
- Se concentrer sur ce qui est meilleur pour la communauté

---

## 🚀 Comment contribuer

### 1. Reporter un bug

Si vous trouvez un bug :
1. Vérifier qu'il n'existe pas déjà dans les [issues](https://github.com/votre-username/appel-internat/issues)
2. Ouvrir une nouvelle issue avec :
   - Titre clair et descriptif
   - Description détaillée du problème
   - Étapes pour reproduire
   - Comportement attendu vs comportement actuel
   - Captures d'écran si applicable
   - Environnement (OS, navigateur, version Node.js)

### 2. Proposer une fonctionnalité

Pour proposer une nouvelle fonctionnalité :
1. Ouvrir une issue avec le label `enhancement`
2. Décrire clairement la fonctionnalité
3. Expliquer pourquoi elle serait utile
4. Proposer une implémentation si possible

### 3. Contribuer du code

1. Fork le projet
2. Créer une branche depuis `main` :
   ```bash
   git checkout -b feature/ma-fonctionnalite
   ```
3. Coder en suivant les [standards de code](#standards-de-code)
4. Tester vos changements localement
5. Commiter avec des messages clairs
6. Pousser vers votre fork
7. Ouvrir une Pull Request

---

## 🛠️ Processus de développement

### Installation

```bash
# Cloner le repo
git clone https://github.com/votre-username/appel-internat.git
cd appel-internat

# Installer les dépendances
npm install

# Configurer la base de données
cp .env.example .env
npx prisma migrate dev
npm run seed

# Lancer le serveur dev
npm run dev
```

### Structure des branches

- `main` : branche principale (stable)
- `feature/xxx` : nouvelles fonctionnalités
- `fix/xxx` : corrections de bugs
- `docs/xxx` : documentation
- `refactor/xxx` : refactorisation

---

## 📝 Standards de code

### TypeScript

- Utiliser TypeScript strict
- Typer toutes les fonctions et variables
- Éviter `any`, préférer `unknown` si nécessaire
- Utiliser les types Prisma générés

```typescript
// ✅ Bon
function createUser(data: { email: string; password: string }): Promise<User> {
  return prisma.user.create({ data })
}

// ❌ Mauvais
function createUser(data: any) {
  return prisma.user.create({ data })
}
```

### React/Next.js

- Composants fonctionnels avec hooks
- `'use client'` seulement si nécessaire (interactivité)
- Pas de composants clients inutiles (performance)
- Nommer les composants en PascalCase

```typescript
// ✅ Bon
'use client'
export default function LoginForm() {
  const [email, setEmail] = useState('')
  // ...
}

// ❌ Mauvais (pas besoin de 'use client' pour composant statique)
'use client'
export default function StaticPage() {
  return <h1>Page statique</h1>
}
```

### Styling (Tailwind)

- Utiliser Tailwind CSS uniquement
- Classes utilitaires directement dans le JSX
- Éviter les styles inline CSS

```typescript
// ✅ Bon
<button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
  Cliquer
</button>

// ❌ Mauvais
<button style={{ backgroundColor: 'blue', padding: '8px 16px' }}>
  Cliquer
</button>
```

### Prisma

- Migrations nommées de façon descriptive
- Toujours utiliser `prisma migrate dev` (jamais `db push` en prod)
- Utiliser les transactions pour opérations multiples

```typescript
// ✅ Bon - Transaction
await prisma.$transaction([
  prisma.user.create({ data: userData }),
  prisma.eleve.create({ data: eleveData }),
])

// ❌ Mauvais - Deux requêtes séparées (pas atomique)
await prisma.user.create({ data: userData })
await prisma.eleve.create({ data: eleveData })
```

---

## 💬 Commits et messages

### Format des commits

Utiliser le format [Conventional Commits](https://www.conventionalcommits.org/) :

```
type(scope): description

[corps optionnel]

[footer optionnel]
```

### Types de commits

- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage (sans changement de code)
- `refactor`: Refactorisation
- `test`: Ajout/modification de tests
- `chore`: Tâches de maintenance

### Exemples

```bash
# ✅ Bon
feat(auth): add password reset functionality
fix(appel): correct date filtering bug
docs(readme): update installation instructions

# ❌ Mauvais
update stuff
fix bug
changes
```

---

## 🔀 Pull Requests

### Checklist avant PR

- [ ] Le code compile sans erreurs (`npm run build`)
- [ ] Les tests passent (si existants)
- [ ] Le code suit les standards du projet
- [ ] La documentation est à jour
- [ ] Les commits sont clairs et atomiques
- [ ] La branche est à jour avec `main`

### Template de PR

```markdown
## Description
[Décrivez vos changements]

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Comment tester
1. Cloner la branche
2. Installer les dépendances
3. [Étapes de test]

## Captures d'écran
[Si applicable]

## Checklist
- [ ] Tests ajoutés/mis à jour
- [ ] Documentation mise à jour
- [ ] Commits suivent les conventions
```

### Processus de review

1. Au moins 1 review requis
2. Tous les commentaires doivent être résolus
3. Les CI/CD doivent passer
4. Merge par squash commit (historique propre)

---

## 🧪 Tests (à venir)

Le projet n'a pas encore de tests automatisés, mais c'est prévu !

Contributions bienvenues pour ajouter :
- Tests unitaires (Jest, Vitest)
- Tests d'intégration (Playwright)
- Tests E2E

---

## 📚 Ressources utiles

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation TypeScript](https://www.typescriptlang.org/docs)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)

---

## ❓ Questions

Si vous avez des questions sur la contribution :
- Ouvrir une [issue](https://github.com/votre-username/appel-internat/issues) avec le label `question`
- Contacter les mainteneurs

---

## 🙏 Merci !

Merci de contribuer à **Appel Internat** et d'aider à améliorer la gestion des internats scolaires ! 🎓
