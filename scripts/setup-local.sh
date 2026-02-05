#!/bin/bash

###############################################################################
# Script de setup initial pour développement local
# Usage: ./scripts/setup-local.sh
###############################################################################

set -e  # Arrêter en cas d'erreur

echo "🚀 Setup local - Appel Internat"
echo "================================"
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier que node est installé
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    echo "Installe Node.js depuis https://nodejs.org/"
    exit 1
fi

echo -e "${BLUE}📦 Installation des dépendances...${NC}"
npm install

echo ""
echo -e "${BLUE}🗄️  Configuration de la base de données...${NC}"

# Vérifier si .env existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Fichier .env introuvable${NC}"
    echo "Copie de .env.example vers .env..."
    cp .env.example .env
    echo -e "${GREEN}✅ Fichier .env créé${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Pense à configurer JWT_SECRET dans .env${NC}"
    echo "Génère un secret avec : openssl rand -base64 32"
    echo ""
fi

# Générer le client Prisma
echo -e "${BLUE}🔧 Génération du client Prisma...${NC}"
npx prisma generate

# Vérifier si la base existe déjà
if [ -f "prisma/dev.db" ]; then
    echo -e "${YELLOW}⚠️  Base de données existante détectée${NC}"
    read -p "Veux-tu la réinitialiser ? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🔄 Réinitialisation de la base...${NC}"
        rm -f prisma/dev.db prisma/dev.db-journal
        npx prisma migrate dev --name init
    else
        echo -e "${BLUE}📊 Mise à jour du schéma existant...${NC}"
        npx prisma migrate dev
    fi
else
    echo -e "${BLUE}🆕 Création de la base de données...${NC}"
    npx prisma migrate dev --name init
fi

# Seed de la base
echo ""
echo -e "${BLUE}🌱 Peuplement de la base avec des données de test...${NC}"
npm run seed

echo ""
echo -e "${GREEN}✅ Setup terminé avec succès !${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🔑 Utilisateurs de test créés :${NC}"
echo ""
echo "  👑 Superadmin (accès complet)"
echo "     Email    : admin@internat.fr"
echo "     Password : admin123"
echo ""
echo "  👤 AED 6ème"
echo "     Email    : aed.6eme@internat.fr"
echo "     Password : password123"
echo ""
echo "  👤 AED 5ème"
echo "     Email    : aed.5eme@internat.fr"
echo "     Password : password123"
echo ""
echo "  👤 AED Terminale"
echo "     Email    : aed.term@internat.fr"
echo "     Password : password123"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}🚀 Pour démarrer le serveur :${NC}"
echo "   npm run dev"
echo ""
echo -e "${BLUE}📊 Pour visualiser la base de données :${NC}"
echo "   npx prisma studio"
echo ""
echo -e "${BLUE}🌐 Puis ouvre ton navigateur :${NC}"
echo "   http://localhost:3000/login"
echo ""
