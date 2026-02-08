import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UserCircle, List, UserPlus, RefreshCw } from 'lucide-react'
import { fetchWithAuth } from '../../auth'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export default function AdminProfesseursListe() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    const url = `${API_BASE}/api/auth/professeurs/${params.toString() ? `?${params}` : ''}`
    fetchWithAuth(API_BASE, url)
      .then((r) => (r && r.ok ? r.json() : []))
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => load(), [search])

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)] dark:bg-gray-700 dark:text-esi-orange">
            <List className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Liste des professeurs</h1>
            <p className="text-slate-600 dark:text-slate-300">Comptes ayant accès à l&apos;espace professeur.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="search"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-slate-100"
          />
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-70 dark:border-gray-600 dark:bg-gray-800 dark:text-slate-200 dark:hover:bg-gray-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
          <Link
            to="/admin/professeurs/creation"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-esi-primary)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--color-esi-primary-hover)]"
          >
            <UserPlus className="h-4 w-4" />
            Créer un compte
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-800">
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">Chargement…</div>
        ) : list.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            Aucun professeur. Utilisez <Link to="/admin/professeurs/creation" className="text-[var(--color-esi-primary)] hover:underline">Créer un compte</Link> pour en ajouter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600 dark:border-gray-600 dark:bg-gray-700/50 dark:text-slate-300">
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Prénom</th>
                  <th className="px-4 py-3 font-medium">Nom</th>
                  <th className="px-4 py-3 font-medium">Matière(s)</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">Inscription</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 dark:border-gray-600 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{p.email}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{p.first_name || '—'}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{p.last_name || '—'}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {p.matieres?.length ? p.matieres.map((m) => m.libelle).join(', ') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={p.is_active ? 'text-green-600' : 'text-slate-400'}>
                        {p.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {p.date_joined ? new Date(p.date_joined).toLocaleDateString('fr-FR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
