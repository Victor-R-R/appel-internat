'use client'

import { memo } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { useAuth, useLogout } from '@/hooks/useAuth'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { AdminHeader } from '@/components/ui/AdminHeader'
import { HeaderActionButton } from '@/components/ui/HeaderButton'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { fetcher } from '@/lib/fetcher'
import { Users, GraduationCap, BarChart3, FileText, Settings, TrendingUp, Shield } from '@/lib/icons'

type Stats = {
  totalAED: number
  totalEleves: number
  totalAppels: number
  totalRecaps: number
}

// Hoist JSX icons pour éviter les re-créations à chaque render
const ICONS = {
  users: <Users className="h-6 w-6" />,
  graduationCap: <GraduationCap className="h-6 w-6" />,
  barChart3: <BarChart3 className="h-8 w-8" />,
  fileText: <FileText className="h-8 w-8" />,
  shield: <Shield className="h-8 w-8" />,
  settings: <Settings className="h-8 w-8" />,
  trendingUp: <TrendingUp className="h-8 w-8" />,
} as const

export default function AdminDashboard() {
  useScrollToTop()

  // SWR charge user et stats EN PARALLÈLE (pas de waterfall !)
  const { user, loading: authLoading } = useAuth({
    requireAuth: true,
    redirectTo: '/login',
  })
  const logout = useLogout()

  // SWR commence à charger les stats immédiatement (pas d'attente du user)
  const { data: statsData, isLoading: statsLoading } = useSWR<{ success: boolean; stats: Stats }>(
    '/api/admin/stats',
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  const stats = statsData?.stats

  if (authLoading || statsLoading) {
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
        subtitle="Tableau de bord"
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
            icon={ICONS.users}
          />
          <StatCard
            title="Élèves"
            value={stats?.totalEleves || 0}
            icon={ICONS.graduationCap}
          />
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <NavCard
            title="Historique des appels"
            description="Voir tous les appels effectués par niveau et date"
            icon={ICONS.barChart3}
            href="/admin/appels"
          />

          <NavCard
            title="Tous les récaps"
            description="Consulter les récapitulatifs de tous les niveaux"
            icon={ICONS.fileText}
            href="/admin/recaps"
          />

          {user.role === 'superadmin' && (
            <>
              <NavCard
                title="Gérer les utilisateurs"
                description="Ajouter, modifier ou supprimer des utilisateurs (AED, CPE, Manager)"
                icon={ICONS.shield}
                href="/admin/aed"
              />

              <NavCard
                title="Gérer les élèves"
                description="Ajouter, modifier ou archiver des élèves par niveau"
                icon={ICONS.graduationCap}
                href="/admin/eleves"
              />

              <NavCard
                title="Paramètres LLM"
                description="Configurer les récaps automatiques (Claude/GPT)"
                icon={ICONS.settings}
                href="/admin/llm"
              />

              <NavCard
                title="Statistiques"
                description="Rapports et analyses détaillées"
                icon={ICONS.trendingUp}
                href="/admin/stats"
              />
            </>
          )}
        </div>
      </main>
    </div>
  )
}

// Composant carte statistique (memoïsé pour éviter les re-renders)
const StatCard = memo(function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: number
  icon: React.ReactNode
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
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full"
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
})

// Composant carte de navigation (memoïsé pour éviter les re-renders)
const NavCard = memo(function NavCard({
  title,
  description,
  icon,
  href,
}: {
  title: string
  description: string
  icon: React.ReactNode
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
      <div
        className="mb-3"
        style={{ color: 'var(--institutional)' }}
      >
        {icon}
      </div>
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
})
