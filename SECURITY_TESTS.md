# Tests de Sécurité

## Tests à effectuer manuellement

### 1. Authentification JWT
```bash
# Tester login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@internat.fr","password":"admin123"}' \
  -c cookies.txt

# Vérifier que le cookie est HttpOnly (doit être dans la réponse headers)

# Tester accès avec cookie
curl http://localhost:3000/api/auth/me -b cookies.txt
```

### 2. Protection middleware
```bash
# Sans authentification → doit retourner 401
curl http://localhost:3000/api/admin/stats

# Avec AED → doit retourner 403
curl http://localhost:3000/api/admin/stats \
  -H "Cookie: auth-token=TOKEN_AED"
```

### 3. Rate limiting
```bash
# 6 tentatives de login échouées → 429 Too Many Requests
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"wrong@mail.com","password":"wrong"}'
  echo "\nTentative $i"
done
```

### 4. Validation Zod
```bash
# Email invalide → erreur validation
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"test"}'

# Niveau invalide → erreur validation
curl -X POST http://localhost:3000/api/admin/eleves \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=TOKEN_ADMIN" \
  -d '{"nom":"Test","prenom":"Test","niveau":"CE2","sexe":"M"}'
```

## Checklist sécurité

- [x] JWT dans cookie HttpOnly
- [x] Middleware protège routes admin
- [x] Validation Zod sur toutes les API
- [x] Rate limiting sur login
- [x] Frontend sans localStorage
- [x] Messages d'erreur génériques (pas d'info sensible)
- [x] HTTPS activé en production (via Vercel)
- [ ] Variables d'environnement en production configurées
- [ ] Tests E2E avec Playwright
- [ ] Scan de vulnérabilités (npm audit)

## Prochaines améliorations sécurité

1. **Refresh tokens** (renouvellement auto sans re-login)
2. **CSRF tokens** pour formulaires sensibles
3. **Content Security Policy headers**
4. **Logs d'audit** (qui accède à quoi, quand)
5. **2FA** pour superadmins
6. **IP whitelist** pour routes admin (optionnel)
