# 🏠 Connexion locale - Guide rapide

## 🚀 Démarrage rapide (première installation)

```bash
# 1. Installer les dépendances
npm install

# 2. Générer le client Prisma
npx prisma generate

# 3. Créer la base de données locale
npx prisma migrate dev --name init

# 4. Peupler avec des utilisateurs de test
npm run seed

# 5. Lancer le serveur de développement
npm run dev
```

Ensuite, ouvre **http://localhost:3000/login**

---

## 🔑 Utilisateurs de test disponibles

### **Superadmin (accès complet)**
```
Email: admin@internat.fr
Password: admin123
```

Accès : Dashboard admin, gestion AED, élèves, récaps, appels, statistiques

---

### **AED 6ème**
```
Email: aed.6eme@internat.fr
Password: password123
```

Accès : Appels pour la classe de 6ème uniquement

---

### **AED 5ème**
```
Email: aed.5eme@internat.fr
Password: password123
```

Accès : Appels pour la classe de 5ème uniquement

---

### **AED Terminale**
```
Email: aed.term@internat.fr
Password: password123
```

Accès : Appels pour la classe de Terminale uniquement

---

## 🗄️ Gérer la base de données locale

### Visualiser la base de données
```bash
npx prisma studio
```

Ouvre **http://localhost:5555** pour voir/éditer les données

### Réinitialiser la base (⚠️ efface toutes les données)
```bash
npx prisma migrate reset
npm run seed
```

### Créer une migration après modification du schema
```bash
npx prisma migrate dev --name nom_de_la_migration
```

---

## 🐛 Problèmes courants

### ❌ Erreur : "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### ❌ Erreur : "Database not found"
```bash
npx prisma migrate dev
npm run seed
```

### ❌ Page blanche après login
1. Vérifie que le serveur tourne (`npm run dev`)
2. Ouvre la console navigateur (F12) pour voir les erreurs
3. Vérifie que les cookies sont activés

### ❌ Erreur : "JWT verification failed"
→ Vérifie que `JWT_SECRET` est défini dans `.env`

---

## 📁 Structure de la base locale

```
prisma/
├── dev.db          ← Base SQLite locale (ignorée par Git)
├── dev.db-journal  ← Journal SQLite
└── migrations/     ← Historique des migrations
```

---

## 🔄 Workflow de développement

1. **Modifier le schema** → `prisma/schema.prisma`
2. **Créer la migration** → `npx prisma migrate dev --name ma_modif`
3. **Mettre à jour le seed** si nécessaire → `src/scripts/seed.ts`
4. **Tester localement** → `npm run dev`
5. **Commit** → `git add . && git commit -m "feat: ..."`
6. **Push** → `git push` (Vercel déploie automatiquement)

---

## 🔐 Sécurité en développement

- ✅ `.env` est dans `.gitignore` → secrets non versionnés
- ✅ Mots de passe de test simples (ok pour dev)
- ⚠️ **Jamais de données réelles en local** si tu travailles sur un laptop non chiffré
- ⚠️ **Change les mots de passe** en production

---

## 🧪 Tester différents rôles

### Tester le flow complet AED
1. Connecte-toi avec `aed.6eme@internat.fr`
2. Tu arrives sur `/appel`
3. Tu vois uniquement les élèves de 6ème
4. Fais un appel de test
5. Vérifie le récap dans `/admin/recaps` (en tant que superadmin)

### Tester les restrictions admin
1. Connecte-toi avec `aed.6eme@internat.fr`
2. Essaie d'aller sur `/admin/dashboard` → Redirection vers `/appel`
3. Déconnecte-toi
4. Connecte-toi avec `admin@internat.fr`
5. Maintenant `/admin/dashboard` est accessible

---

## 📊 Vérifier que tout fonctionne

### Checklist post-installation
- [ ] `npm run dev` démarre sans erreur
- [ ] http://localhost:3000/login affiche la page de connexion
- [ ] Login avec `admin@internat.fr` fonctionne
- [ ] Redirection vers `/admin/dashboard` après login
- [ ] Création d'un appel fonctionne
- [ ] `npx prisma studio` affiche les données

---

## 🆘 Besoin d'aide ?

### Logs utiles
```bash
# Logs Next.js
npm run dev

# Logs Prisma
npx prisma migrate dev --name test

# Vérifier la DB
npx prisma studio
```

### Réinitialisation totale (en cas de problème)
```bash
# Supprimer la base et tout recommencer
rm -f prisma/dev.db prisma/dev.db-journal
npx prisma migrate dev
npm run seed
```
