# Système de Notifications Toast

## Vue d'ensemble

L'application utilise un système de notifications Toast unifié pour remplacer tous les `alert()` natifs. Les notifications apparaissent dans le coin supérieur droit de l'écran avec des animations fluides.

## Types de notifications

- ✅ **Success** : Actions réussies (création, modification, suppression)
- ❌ **Error** : Erreurs de validation ou de connexion
- ⚠️ **Warning** : Avertissements et actions à confirmer
- ℹ️ **Info** : Informations générales

## Utilisation

### Dans un composant React

```tsx
import { useToast } from '@/contexts/ToastContext'
// ou bien
import { useToast } from '@/lib/toast'

function MyComponent() {
  const toast = useToast()

  const handleSuccess = () => {
    toast.success('Opération réussie !')
  }

  const handleError = () => {
    toast.error('Une erreur est survenue')
  }

  const handleWarning = () => {
    toast.warning('Attention, cette action est irréversible')
  }

  const handleInfo = () => {
    toast.info('Information importante')
  }

  // Avec durée personnalisée (en millisecondes)
  const handleCustomDuration = () => {
    toast.success('Message rapide', 2000) // Disparaît après 2 secondes
  }

  return <button onClick={handleSuccess}>Afficher notification</button>
}
```

### Options de durée

Par défaut, les notifications disparaissent après **4 secondes**. Vous pouvez personnaliser cette durée :

```tsx
toast.success('Message court', 2000)    // 2 secondes
toast.error('Message long', 10000)      // 10 secondes
toast.info('Permanent', 0)              // Ne disparaît pas automatiquement
```

## Architecture

### Composants

1. **Toast.tsx** : Composant de notification individuel
2. **ToastContainer.tsx** : Conteneur pour afficher toutes les notifications
3. **ToastContext.tsx** : Contexte React pour gérer l'état global

### Intégration

Le `ToastProvider` est déjà intégré dans le layout racine (`src/app/layout.tsx`), donc toutes les pages peuvent utiliser `useToast()` directement.

## Intégration avec useCRUD

Le hook `useCRUD` utilise automatiquement le système de notifications pour toutes les opérations CRUD :

- ✅ Création réussie → toast.success
- ✅ Modification réussie → toast.success
- ✅ Suppression réussie → toast.success
- ❌ Erreur → toast.error

Aucune configuration supplémentaire n'est nécessaire !

## Personnalisation

### Couleurs et styles

Les couleurs sont définies dans `Toast.tsx` :

```tsx
const COLORS = {
  success: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-800' },
  error: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-800' },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-800' },
  info: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-800' },
}
```

Pour modifier les couleurs, éditez simplement ces valeurs Tailwind.

### Position

Par défaut, les notifications apparaissent en haut à droite. Pour changer la position, modifiez la classe dans `ToastContainer` :

```tsx
// Actuel : coin supérieur droit
className="fixed inset-0 flex flex-col items-end justify-start"

// Exemples :
// Coin supérieur gauche : items-start justify-start
// Coin inférieur droit : items-end justify-end
// Centré en bas : items-center justify-end
```

## Migration depuis alert()

Avant :
```tsx
if (data.success) {
  alert('✅ Opération réussie')
} else {
  alert('❌ Erreur : ' + data.error)
}
```

Après :
```tsx
const toast = useToast()

if (data.success) {
  toast.success('Opération réussie')
} else {
  toast.error(data.error || 'Une erreur est survenue')
}
```

## Exemples dans le code

Consultez ces fichiers pour voir des exemples d'utilisation :

- `src/hooks/useCRUD.ts` - Intégration dans les opérations CRUD
- `src/app/appel/page.tsx` - Notifications lors de l'enregistrement d'appel
- `src/app/admin/eleves/page.tsx` - Notifications de gestion d'élèves
- `src/app/admin/aed/page.tsx` - Notifications de gestion d'utilisateurs
