'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth, useLogout } from '@/hooks/useAuth'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { AdminHeader } from '@/components/ui/AdminHeader'
import { HeaderActionButton } from '@/components/ui/HeaderButton'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

type Stats = {
  totalAED: number
  totalEleves: number
  totalAppels: number
  totalRecaps: number
}

export default function AdminDashboard() {
  useScrollToTop()
  const { user, loading: authLoading } = useAuth({
    requireAuth: true,
    redirectTo: '/login',
  })
  const logout = useLogout()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadStats()
    }
  }, [user])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return <LoadingSpinner />
  }

  if (!user) return null

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      <AdminHeader
        title={`${user.prenom} ${user.nom} • ${user.role === 'superadmin' ? 'Superadmin' : user.role === 'cpe' ? 'CPE' : user.role === 'manager' ? 'Manager' : 'AED'}`}
        subtitle="🔐 Gestion"
        variant="blue"
        actions={
          <HeaderActionButton onClick={logout}>
            Déconnexion
          </HeaderActionButton>
        }
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Statistiques */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <StatCard
            title="AED"
            value={stats?.totalAED || 0}
            icon="👥"
          />
          <StatCard
            title="Élèves"
            value={stats?.totalEleves || 0}
            icon="🎓"
          />
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <NavCard
            title="Historique des appels"
            description="Voir tous les appels effectués par niveau et date"
            icon="📊"
            href="/admin/appels"
          />

          <NavCard
            title="Tous les récaps"
            description="Consulter les récapitulatifs de tous les niveaux"
            icon="📝"
            href="/admin/recaps"
          />

          {user.role === 'superadmin' && (
            <>
              <NavCard
                title="Gérer les utilisateurs"
                description="Ajouter, modifier ou supprimer des utilisateurs (AED, CPE, Manager)"
                icon="👥"
                href="/admin/aed"
              />

              <NavCard
                title="Gérer les élèves"
                description="Ajouter, modifier ou archiver des élèves par niveau"
                icon="🎓"
                href="/admin/eleves"
              />

              <NavCard
                title="Paramètres LLM"
                description="Configurer les récaps automatiques (Claude/GPT)"
                icon="🤖"
                href="/admin/llm"
              />

              <NavCard
                title="Statistiques"
                description="Rapports et analyses détaillées"
                icon="📈"
                href="/admin/stats"
              />
            </>
          )}
        </div>
      </main>
    </div>
  )
}

// Composant carte statistique
function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: number
  icon: string
}) {
  return (
    <div
      className="p-6"
      style={{
        backgroundColor: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div className="flex items-center">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-2xl"
          style={{
            backgroundColor: 'var(--institutional-light)',
            color: 'var(--institutional)',
          }}
        >
          {icon}
        </div>
        <div className="ml-4">
          <p
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {title}
          </p>
          <p
            className="text-3xl"
            style={{
              color: 'var(--text-primary)',
              fontWeight: 'var(--font-bold)',
            }}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

// Composant carte de navigation
function NavCard({
  title,
  description,
  icon,
  href,
}: {
  title: string
  description: string
  icon: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="block p-6 transition-all"
      style={{
        backgroundColor: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-standard)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div className="mb-3 text-4xl">{icon}</div>
      <h3
        className="mb-2 text-lg"
        style={{
          color: 'var(--text-primary)',
          fontWeight: 'var(--font-semibold)',
        }}
      >
        {title}
      </h3>
      <p
        className="text-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        {description}
      </p>
    </Link>
  )
}
