'use client' // Composant client pour gérer le state React

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  // State pour les champs du formulaire
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  /**
   * Gérer la soumission du formulaire
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // Empêche le rechargement de la page
    setError('')
    setLoading(true)

    try {
      // Appel à notre API route
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        // Login réussi ! Le JWT est maintenant dans un cookie HttpOnly
        // Rediriger selon le rôle
        if (data.user.role === 'superadmin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/appel')
        }
      } else {
        // Afficher l'erreur
        setError(data.error)
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      <div
        className="w-full max-w-md space-y-8 p-8"
        style={{
          backgroundColor: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        {/* Header */}
        <div className="text-center">
          <h1
            className="text-3xl"
            style={{
              color: 'var(--institutional)',
              fontWeight: 'var(--font-bold)',
            }}
          >
            Appel Internat
          </h1>
          <p
            className="mt-2 text-sm"
            style={{
              color: 'var(--text-secondary)',
              fontWeight: 'var(--font-semibold)',
            }}
          >
            Internat d&apos;Excellence de Sourdun
          </p>
          <p
            className="mt-1 text-sm"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Connectez-vous avec votre compte
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Message d'erreur */}
          {error && (
            <div
              className="p-4"
              style={{
                backgroundColor: 'var(--error-light)',
                borderLeft: '3px solid var(--error)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--error)' }}
              >
                {error}
              </p>
            </div>
          )}

          {/* Champ Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-admin mt-1"
              placeholder="aed.6eme@internat.fr"
            />
          </div>

          {/* Champ Mot de passe */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-admin mt-1"
              placeholder="••••••••"
            />
          </div>

          {/* Bouton Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Infos de test - seulement en développement */}
        {process.env.NODE_ENV === 'development' && (
          <div
            className="mt-4 p-4"
            style={{
              backgroundColor: 'var(--institutional-light)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <p
              className="text-xs"
              style={{ color: 'var(--institutional)' }}
            >
              <strong>Test :</strong> aed.6eme@internat.fr / password123
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
