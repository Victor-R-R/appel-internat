# Système de design - Appel Internat

Esthétique: **Registre administratif numérique**

## Direction

### Monde du produit
**Internat scolaire / Gestion administrative éducative**

Concepts clés:
- Registres et cahiers d'appel — L'acte quotidien de noter présences/absences
- Rigueur administrative — Traçabilité, fiabilité, confiance institutionnelle
- Tableau de classe — Ardoise, organisation visuelle claire
- Responsabilité — AED en charge d'un groupe, devoir de surveillance
- Permanence — Routine quotidienne, stabilité
- Papier administratif — Formulaires officiels, documents structurés
- Hiérarchie claire — Rôles définis (AED, CPE, Manager, Superadmin)

### Couleurs du monde
- **Bleu institutionnel** — Confiance, autorité éducative, sérieux
- **Blanc papier** — Feuilles de registre, documents administratifs
- **Gris ardoise** — Tableau noir, structure, organisation
- **Encre bleue/noire** — Stylo administratif, notes manuscrites
- **Tampon rouge** — Mentions importantes, alertes, absences critiques
- **Vert validation** — Cases cochées, approbations, présences confirmées

### Signature
**Registre numérique structuré** — Interface inspirée des formulaires administratifs papier avec lignes séparées par bordures subtiles, hiérarchie claire comme un vrai registre d'appel. Pas de cartes flottantes génériques, mais une structure organisée et professionnelle.

### Ce qu'on évite
- ❌ Cartes blanches flottantes génériques
- ❌ Gradients décoratifs sans signification
- ❌ Boutons statuts colorés génériques
- ✅ Structure de registre avec lignes séparées
- ✅ Surfaces monochromes avec élévations subtiles
- ✅ Système visuel administratif authentique

## Profondeur

**Stratégie:** Borders-only avec élévations subtiles via changements de teintes de surface.

- Pas de shadows dramatiques
- Séparation via bordures rgba subtiles (6-15% d'opacité)
- Élévations créées par variations de luminosité de surface
- Style "papier administratif propre"

## Espacement

**Base:** 4px

**Échelle:**
```
--space-micro: 4px    (gaps icônes)
--space-xs: 8px       (padding mini)
--space-sm: 12px      (gaps internes)
--space-md: 16px      (padding standard)
--space-lg: 24px      (padding cartes)
--space-xl: 32px      (sections)
--space-2xl: 48px     (séparations majeures)
```

## Système de tokens

### Surfaces (Élévation)
```css
--surface-base: #fafafa           /* Fond de page */
--surface-card: #ffffff           /* Cartes, conteneurs */
--surface-elevated: #ffffff       /* Modals, dropdowns */
--surface-institutional: #0C71C3  /* Header institutionnel */
```

### Texte (Hiérarchie)
```css
--text-primary: #1a1a1a     /* Titres, données importantes */
--text-secondary: #525252   /* Corps de texte, labels */
--text-tertiary: #737373    /* Métadonnées, descriptions */
--text-muted: #a3a3a3       /* Placeholders, désactivé */
--text-inverse: #ffffff     /* Texte sur fonds colorés */
```

### Bordures
```css
--border-subtle: rgba(0, 0, 0, 0.06)     /* Séparations douces */
--border-standard: rgba(0, 0, 0, 0.10)   /* Bordures par défaut */
--border-emphasis: rgba(0, 0, 0, 0.15)   /* Bordures importantes */
--border-focus: #0C71C3                  /* Focus rings */
```

### Couleurs sémantiques

**Institutionnel (Bleu confiance)**
```css
--institutional: #0C71C3
--institutional-hover: #0a5ea3
--institutional-light: rgba(12, 113, 195, 0.08)
```

**Validation (Vert présent)**
```css
--success: #16a34a
--success-hover: #15803d
--success-light: rgba(22, 163, 74, 0.08)
--success-border: rgba(22, 163, 74, 0.2)
```

**Attention (Orange ACF)**
```css
--warning: #ea580c
--warning-hover: #c2410c
--warning-light: rgba(234, 88, 12, 0.08)
--warning-border: rgba(234, 88, 12, 0.2)
```

**Critique (Rouge absent)**
```css
--error: #dc2626
--error-hover: #b91c1c
--error-light: rgba(220, 38, 38, 0.08)
--error-border: rgba(220, 38, 38, 0.2)
```

### Typographie

**Font stack:** System fonts optimisés pour lisibilité
```css
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif
```

**Poids:**
```css
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

**Tailles:**
```css
--text-xs: 0.75rem    /* 12px - labels secondaires */
--text-sm: 0.875rem   /* 14px - corps de texte */
--text-base: 1rem     /* 16px - texte standard */
--text-lg: 1.125rem   /* 18px - sous-titres */
--text-xl: 1.25rem    /* 20px - titres de carte */
--text-2xl: 1.5rem    /* 24px - titres de page */
--text-3xl: 2rem      /* 32px - hero numbers */
```

### Border Radius
```css
--radius-sm: 0.375rem   /* 6px - inputs, badges */
--radius-md: 0.5rem     /* 8px - cartes */
--radius-lg: 0.75rem    /* 12px - modals */
```

### Transitions
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1)
```

## Patterns de composants

### Bouton primaire institutionnel
```tsx
<button className="btn-primary">
  Se connecter
</button>
```
- Fond: `--institutional`
- Texte: `--text-inverse`
- Hover: `--institutional-hover`
- Focus: outline 2px `--border-focus`
- Disabled: fond `--border-emphasis`, texte `--text-muted`

### Bouton secondaire
```tsx
<button className="btn-secondary">
  Annuler
</button>
```
- Fond: `--surface-card`
- Texte: `--text-primary`
- Bordure: `--border-standard`
- Hover: fond `--control-bg-hover`, bordure `--border-emphasis`

### Carte registre
```tsx
<div className="card-registre">
  Contenu
</div>
```
- Fond: `--surface-card`
- Bordure: `--border-subtle`
- Hover: bordure `--border-standard`
- Padding: `--space-lg`

### Input administratif
```tsx
<input className="input-admin" />
```
- Fond: `--control-bg`
- Bordure: `--control-border`
- Focus: bordure `--control-border-focus`, shadow `--institutional-light`
- Hover: fond `--control-bg-hover`
- Placeholder: `--text-muted`

### Badge statut
```tsx
<Badge variant="present">Présent</Badge>
<Badge variant="acf">ACF</Badge>
<Badge variant="absent">Absent</Badge>
```
- Fond léger: `--{variant}-light`
- Texte: `--{variant}`
- Bordure: `--{variant}-border`

### Ligne de registre (Liste élèves)
Structure avec bordures subtiles entre lignes:
```tsx
<div style={{
  backgroundColor: 'var(--surface-card)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)',
}}>
  {items.map((item, index) => (
    <div
      key={item.id}
      style={{
        borderBottom: index < items.length - 1
          ? '1px solid var(--border-subtle)'
          : 'none',
        padding: 'var(--space-md)',
      }}
    >
      {/* Contenu */}
    </div>
  ))}
</div>
```

### Header institutionnel
- Fond: `--surface-institutional`
- Texte: `--text-inverse`
- Bordure inférieure: `rgba(0, 0, 0, 0.1)`
- Pas de gradient décoratif

### Stats cards
- Fond: `--surface-card`
- Bordure: `--border-subtle`
- Label: uppercase, `--text-tertiary`, tracking-wide
- Valeur: `--text-3xl`, `--font-bold`, `--text-primary`
- Icône: fond `--institutional-light`, couleur `--institutional`

## Principes d'application

1. **Toujours utiliser les tokens CSS** — Jamais de hex hardcodés
2. **Hiérarchie par contraste subtil** — Pas de sauts dramatiques
3. **Bordures rgba** — Mélangent mieux avec le fond
4. **Structure registre** — Lignes séparées, pas cartes flottantes
5. **Couleurs sémantiques** — Seulement pour statuts et actions
6. **Typographie claire** — Medium/semibold/bold pour hiérarchie
7. **Espacement cohérent** — Multiples de la base 4px
8. **Transitions rapides** — 150-200ms, deceleration easing

## Checklist de cohérence

Avant de commiter du nouveau code UI:

- [ ] Utilise les tokens CSS (pas de hex/couleurs hardcodées)
- [ ] Suit l'esthétique registre (bordures subtiles, pas cartes flottantes)
- [ ] Espacement en multiples de 4px
- [ ] Typographie avec poids approprié (medium/semibold/bold)
- [ ] Couleurs sémantiques uniquement pour statuts
- [ ] Transitions rapides et fluides
- [ ] Focus rings visibles pour accessibilité
- [ ] États hover/focus/disabled définis
