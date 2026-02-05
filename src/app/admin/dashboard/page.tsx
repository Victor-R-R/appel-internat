'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth, useLogout } from '@/hooks/useAuth'

type User = {
  id: string
  email: string
  role: string
  niveau?: string | null
}

type Stats = {
  totalAED: number
  totalEleves: number
  totalAppels: number
  totalRecaps: number
}

export default function AdminDashboard() {
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
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="shadow-lg" style={{ background: 'linear-gradient(to right, #0C71C3, #4d8dc1)' }}>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                🔐 Administration
              </h1>
              <p className="mt-1 text-sm text-white/80">
                {user.email} • {user.role === 'superadmin' ? 'Superadmin' : user.role === 'cpe' ? 'CPE' : user.role === 'manager' ? 'Manager' : 'AED'} • Internat d&apos;Excellence de Sourdun
              </p>
            </div>
            <button
              onClick={logout}
              className="btn-primary rounded-md bg-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/30 transition-all"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Statistiques */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <StatCard
            title="Utilisateurs"
            value={stats?.totalAED || 0}
            icon="👥"
            color="bg-[#0C71C3]"
          />
          <StatCard
            title="Élèves"
            value={stats?.totalEleves || 0}
            icon="🎓"
            color="bg-[#7EBEC5]"
          />
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Historique des appels - Tous */}
          <NavCard
            title="Historique des appels"
            description="Voir tous les appels effectués par niveau et date"
            icon="📊"
            href="/admin/appels"
            color="bg-[#e2e5ed] border-[#0C71C3]/30 hover:bg-[#d5dae8]"
          />

          {/* Récaps - Tous */}
          <NavCard
            title="Tous les récaps"
            description="Consulter les récapitulatifs de tous les niveaux"
            icon="📝"
            href="/admin/recaps"
            color="bg-[#e2e5ed] border-[#4d8dc1]/30 hover:bg-[#d5dae8]"
          />

          {/* Gestion utilisateurs - Superadmin uniquement */}
          {user.role === 'superadmin' && (
            <NavCard
              title="Gérer les utilisateurs"
              description="Ajouter, modifier ou supprimer des utilisateurs (AED, CPE, Manager)"
              icon="👥"
              href="/admin/aed"
              color="bg-[#e2e5ed] border-[#0C71C3]/30 hover:bg-[#d5dae8]"
            />
          )}

          {/* Gestion élèves - Superadmin uniquement */}
          {user.role === 'superadmin' && (
            <NavCard
              title="Gérer les élèves"
              description="Ajouter, modifier ou archiver des élèves par niveau"
              icon="🎓"
              href="/admin/eleves"
              color="bg-[#e2e5ed] border-[#7EBEC5]/30 hover:bg-[#d5dae8]"
            />
          )}

          {/* Paramètres LLM - Superadmin uniquement */}
          {user.role === 'superadmin' && (
            <NavCard
              title="Paramètres LLM"
              description="Configurer les récaps automatiques (Claude/GPT)"
              icon="🤖"
              href="/admin/llm"
              color="bg-[#e2e5ed] border-[#7EBEC5]/30 hover:bg-[#d5dae8]"
            />
          )}

          {/* Statistiques - Superadmin uniquement */}
          {user.role === 'superadmin' && (
            <NavCard
              title="Statistiques"
              description="Rapports et analyses détaillées"
              icon="📈"
              href="/admin/stats"
              color="bg-[#e2e5ed] border-[#4d8dc1]/30 hover:bg-[#d5dae8]"
            />
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
  color,
}: {
  title: string
  value: number
  icon: string
  color: string
}) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="p-6">
        <div className="flex items-center">
          <div className={`${color} flex h-12 w-12 items-center justify-center rounded-full text-2xl`}>
            {icon}
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
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
  color,
}: {
  title: string
  description: string
  icon: string
  href: string
  color: string
}) {
  return (
    <Link
      href={href}
      className={`block rounded-lg border-2 p-6 transition-all ${color}`}
    >
      <div className="mb-3 text-4xl">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  )
}
