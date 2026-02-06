import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, UserPlus, Search, List, TrendingUp, Users } from 'lucide-react'
import { fetchWithAuth } from '../../auth'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export default function AdminEtudiantsDashboard() {
  const [total, setTotal] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWithAuth(API_BASE, `${API_BASE}/api/auth/students/`)
      .then((r) => (r && r.ok ? r.json() : []))
      .then((data) => setTotal(Array.isArray(data) ? data.length : 0))
      .catch(() => setTotal(0))
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    {
      title: 'Création',
      description: 'Créer un étudiant ou importer un CSV',
      icon: UserPlus,
      to: '/admin/etudiants/creation',
      color: 'bg-[var(--color-esi-orange-light)] text-[var(--color-esi-orange)]',
    },
    {
      title: 'Recherche avancée',
      description: 'Filtres, tri, vues sauvegardées, export Excel',
      icon: Search,
      to: '/admin/etudiants/recherche',
      color: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Liste',
      description: 'Voir tous les étudiants et actions',
      icon: List,
      to: '/admin/etudiants/liste',
      color: 'bg-green-100 text-green-700',
    },
  ]

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)]">
          <GraduationCap className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Gestion des étudiants</h1>
          <p className="text-slate-600">Tableau de bord et accès rapide aux actions.</p>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-3">
            <Users className="h-8 w-8 text-slate-600" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Nombre total d&apos;étudiants</p>
            <p className="text-3xl font-bold text-slate-900">
              {loading ? '…' : total ?? 0}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ title, description, icon: Icon, to, color }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[var(--color-esi-primary)]/30 hover:shadow-md"
          >
            <div className={`mb-4 inline-flex rounded-lg p-2.5 ${color}`}>
              <Icon className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <h2 className="mb-1 text-lg font-semibold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-600">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
