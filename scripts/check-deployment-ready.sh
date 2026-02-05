#!/bin/bash

###############################################################################
# Vérifie que l'application est prête pour le déploiement sur Vercel
# Usage: ./scripts/check-deployment-ready.sh
###############################################################################

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🔍 Vérification avant déploiement Vercel"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0

# Fonction pour afficher une erreur
error() {
    echo -e "${RED}❌ $1${NC}"
    ((ERRORS++))
}

# Fonction pour afficher un avertissement
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

# Fonction pour afficher un succès
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 1. Vérifier que .env n'est PAS dans le repo
echo -e "${BLUE}📋 Vérification sécurité...${NC}"
if git ls-files --error-unmatch .env 2>/dev/null; then
    error ".env est tracké par Git ! Exécute : git rm --cached .env"
else
    success ".env n'est pas dans le repo Git"
fi

# 2. Vérifier que .env.example existe
if [ -f ".env.example" ]; then
    success ".env.example existe"
else
    warning ".env.example n'existe pas (non critique)"
fi

# 3. Vérifier le .gitignore
if grep -q "^\.env" .gitignore; then
    success ".gitignore contient .env*"
else
    error ".gitignore ne protège pas les fichiers .env"
fi

# 4. Vérifier que la base SQLite n'est pas trackée
if git ls-files --error-unmatch prisma/dev.db 2>/dev/null; then
    error "prisma/dev.db est tracké par Git ! Exécute : git rm --cached prisma/dev.db"
else
    success "Base SQLite locale non trackée"
fi

echo ""
echo -e "${BLUE}📦 Vérification dépendances...${NC}"

# 5. Vérifier que node_modules existe
if [ -d "node_modules" ]; then
    success "node_modules installé"
else
    error "node_modules manquant. Exécute : npm install"
fi

# 6. Vérifier que Prisma client est généré
if [ -d "node_modules/.prisma/client" ]; then
    success "Client Prisma généré"
else
    error "Client Prisma manquant. Exécute : npx prisma generate"
fi

echo ""
echo -e "${BLUE}🔧 Vérification configuration...${NC}"

# 7. Vérifier que le schéma Prisma existe
if [ -f "prisma/schema.prisma" ]; then
    success "Schema Prisma existe"
else
    error "prisma/schema.prisma manquant"
fi

# 8. Vérifier que package.json a le script postinstall
if grep -q '"postinstall"' package.json; then
    success "Script postinstall configuré (prisma generate)"
else
    warning "Script postinstall manquant dans package.json"
fi

echo ""
echo -e "${BLUE}🧪 Vérification build...${NC}"

# 9. Tester le build
echo "   Building Next.js..."
if npm run build > /tmp/build.log 2>&1; then
    success "Build Next.js réussi"
else
    error "Build Next.js échoué. Voir /tmp/build.log"
    echo ""
    echo "Dernières lignes du log :"
    tail -n 20 /tmp/build.log
fi

echo ""
echo -e "${BLUE}📝 Variables d'environnement requises pour Vercel...${NC}"
echo ""

REQUIRED_VARS=(
    "DATABASE_URL"
    "JWT_SECRET"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"
)

echo "Tu devras configurer ces variables dans Vercel Dashboard :"
echo ""
for var in "${REQUIRED_VARS[@]}"; do
    echo "  • $var"
done

echo ""
echo "Optional (pour récaps IA) :"
echo "  • OPENAI_API_KEY"
echo ""

# 10. Vérifier que les valeurs sensibles ne sont pas en dur dans le code
echo -e "${BLUE}🔐 Scan sécurité...${NC}"

if grep -r "postgresql://" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "example\|template\|comment" > /dev/null; then
    warning "URL PostgreSQL trouvée en dur dans le code source"
fi

if grep -r "sk-.*" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "example\|template\|comment" > /dev/null; then
    warning "Clé API potentiellement en dur dans le code source"
fi

success "Scan sécurité basique terminé"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 Résultat final${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Aucune erreur bloquante${NC}"
else
    echo -e "${RED}❌ $ERRORS erreur(s) bloquante(s)${NC}"
fi

if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS avertissement(s)${NC}"
fi

echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🚀 Prêt pour le déploiement !${NC}"
    echo ""
    echo "Prochaines étapes :"
    echo "  1. Configure les variables d'environnement dans Vercel"
    echo "  2. git add . && git commit -m 'ready for deployment'"
    echo "  3. git push origin main"
    echo "  4. Vercel déploiera automatiquement"
    echo "  5. Configure la base Supabase (voir DEPLOY_VERCEL.md)"
    echo "  6. Crée le premier admin : ./scripts/create-first-admin.sh"
    echo ""
    exit 0
else
    echo -e "${RED}⛔ Corrige les erreurs avant de déployer${NC}"
    echo ""
    exit 1
fi
