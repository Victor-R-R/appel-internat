#!/bin/bash

###############################################################################
# Script pour créer le premier admin en production via l'API
# Usage: ./scripts/create-first-admin.sh
###############################################################################

set -e

echo "🔐 Création du premier admin en production"
echo "==========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Demander l'URL de production
echo -e "${BLUE}📍 URL de ton application Vercel${NC}"
read -p "   (ex: https://ton-projet.vercel.app) : " VERCEL_URL

# Vérifier si l'URL est vide
if [ -z "$VERCEL_URL" ]; then
    echo -e "${RED}❌ URL requise${NC}"
    exit 1
fi

# Supprimer le slash final si présent
VERCEL_URL=${VERCEL_URL%/}

# Vérifier d'abord si un admin existe déjà
echo ""
echo -e "${BLUE}🔍 Vérification de l'état actuel...${NC}"
RESPONSE=$(curl -s "$VERCEL_URL/api/setup/first-admin")
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

# Vérifier si adminExists est true
if echo "$RESPONSE" | grep -q '"adminExists":true'; then
    echo ""
    echo -e "${YELLOW}⚠️  Un admin existe déjà !${NC}"
    echo -e "${RED}❌ Impossible de créer un nouvel admin via cet endpoint${NC}"
    echo ""
    echo "Pour créer des admins supplémentaires :"
    echo "  1. Connecte-toi avec le superadmin existant"
    echo "  2. Va dans /admin/aed"
    echo "  3. Crée un nouvel utilisateur avec le rôle 'superadmin'"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Aucun admin trouvé, création possible${NC}"
echo ""

# Demander les infos du nouvel admin
echo -e "${BLUE}📝 Informations du premier admin${NC}"
read -p "   Email : " ADMIN_EMAIL
read -sp "   Password (min 8 caractères) : " ADMIN_PASSWORD
echo ""
read -p "   Nom : " ADMIN_NOM
read -p "   Prénom : " ADMIN_PRENOM

# Vérifier que les champs obligatoires sont remplis
if [ -z "$ADMIN_EMAIL" ] || [ -z "$ADMIN_PASSWORD" ]; then
    echo -e "${RED}❌ Email et mot de passe requis${NC}"
    exit 1
fi

# Créer le JSON payload
JSON_PAYLOAD=$(jq -n \
    --arg email "$ADMIN_EMAIL" \
    --arg password "$ADMIN_PASSWORD" \
    --arg nom "$ADMIN_NOM" \
    --arg prenom "$ADMIN_PRENOM" \
    '{email: $email, password: $password, nom: $nom, prenom: $prenom}')

# Envoyer la requête
echo ""
echo -e "${BLUE}🚀 Création de l'admin en cours...${NC}"
RESPONSE=$(curl -s -X POST "$VERCEL_URL/api/setup/first-admin" \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD")

# Afficher la réponse
echo ""
echo -e "${BLUE}📋 Réponse du serveur :${NC}"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

# Vérifier le succès
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo ""
    echo -e "${GREEN}✅ Admin créé avec succès !${NC}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${YELLOW}⚠️  IMPORTANT - Sécurité${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Tu dois IMMÉDIATEMENT supprimer l'endpoint de setup :"
    echo ""
    echo "  rm src/app/api/setup/first-admin/route.ts"
    echo "  git add ."
    echo "  git commit -m \"security: remove first-admin setup endpoint\""
    echo "  git push"
    echo ""
    echo "Vercel redéploiera automatiquement sans cet endpoint."
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${GREEN}🎉 Tu peux maintenant te connecter :${NC}"
    echo "   URL : $VERCEL_URL/login"
    echo "   Email : $ADMIN_EMAIL"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Erreur lors de la création${NC}"
    echo "Vérifie les logs Vercel pour plus de détails"
    exit 1
fi
