import { useState, useEffect, useCallback } from 'react'
import { Users, RefreshCw, Eye, Power, Trash2, Mail, UserCheck } from 'lucide-react'
import { fetchWithAuth } from '../../auth'
import Modal from '../../components/Modal'
import UserDetailModal from './UserDetailModal'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

const ROLE_LABELS = {
  admin: 'Super admin',
  admin_ecole: 'Admin école',
  professeur: 'Professeur',
  bibliothecaire: 'Bibliothécaire',
  user: 'Étudiant',
}

const ROLE_BADGES = {
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  admin_ecole: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  professeur: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  bibliothecaire: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  user: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
}

const ROLE_OPTIONS = [
  { value: '', label: 'Tous les rôles' },
  { value: 'user', label: 'Étudiant' },
  { value: 'professeur', label: 'Professeur' },
  { value: 'bibliothecaire', label: 'Bibliothécaire' },
  { value: 'admin_ecole', label: 'Admin école' },
  { value: 'admin', label: 'Super admin' },
]

export default function AdminUtilisateurs() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [viewing, setViewing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (role) params.set('role', role)
    const qs = params.toString()
    fetchWithAuth(API_BASE, `${API_BASE}/api/auth/users/${qs ? `?${qs}` : ''}`)
      .then((r) => (r && r.ok ? r.json() : []))
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [search, role])

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [load])

  function flash(msg) {
    setNotice(msg)
    setTimeout(() => setNotice(null), 3500)
  }

  async function toggleActive(u) {
    setBusy(true)
    const r = await fetchWithAuth(API_BASE, `${API_BASE}/api/auth/users/${u.id}/toggle-active/`, {
      method: 'POST',
    })
    setBusy(false)
    if (r && r.ok) {
      load()
      flash(u.is_active ? 'Compte désactivé.' : 'Compte activé.')
    } else if (r) {
      const data = await r.json().catch(() => ({}))
      flash(data?.detail || 'Action impossible.')
    }
  }

  async   function confirmDelete() {
    if (!toDelete) return
    setBusy(true)
    const r = await fetchWithAuth(API_BASE, `${API_BASE}/api/auth/users/${toDelete.id}/`, {
      method: 'DELETE',
    })
    setBusy(false)
    setToDelete(null)
    if (r && (r.ok || r.status === 204)) {
      setUsers((prev) => prev.filter((u) => u.id !== toDelete.id))
      flash('Compte supprimé.')
    } else if (r) {
      const data = await r.json().catch(() => ({}))
      flash(data?.detail || 'Suppression impossible.')
    }
  }

  return (
    <div className="p-6 sm:p-8">
      {notice && (
        <div className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-slate-200">
          {notice}
        </div>
      )}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)] dark:bg-esi-orange/20 dark:text-esi-orange">
            <Users className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Gestion des utilisateurs</h1>
            <p className="text-slate-600 dark:text-slate-400">Tous les comptes, avec recherche, filtres et actions.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-70 dark:border-gray-600 dark:bg-gray-800 dark:text-slate-200 dark:hover:bg-gray-700"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Rafraîchir
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Rechercher par email, prénom, nom…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-slate-100"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-slate-100"
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {users.length} compte{users.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">Chargement…</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            Aucun utilisateur ne correspond à ces critères.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600 dark:border-gray-700 dark:bg-gray-700/50 dark:text-slate-300">
                  <th className="px-4 py-3 font-medium">Nom</th>
                  <th className="px-4 py-3 font-medium">Prénom</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Rôle</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-gray-700/40">
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{u.last_name || '—'}</td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{u.first_name || '—'}</td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${u.email}`} className="inline-flex items-center gap-1 text-[var(--color-esi-primary)] hover:underline">
                        <Mail className="h-3.5 w-3.5" />
                        {u.email}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_BADGES[u.role] || 'bg-slate-100 text-slate-600'}`}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-slate-400'}`}>
                        {u.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setViewing(u)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-gray-600 dark:bg-gray-800 dark:text-slate-200 dark:hover:bg-gray-700"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Voir
                        </button>
                        {!u.is_superuser && (
                          <button
                            type="button"
                            onClick={() => toggleActive(u)}
                            disabled={busy}
                            className={`rounded p-1.5 hover:bg-slate-200 dark:hover:bg-gray-700 ${u.is_active ? 'text-amber-600 hover:text-amber-800 dark:hover:text-amber-300' : 'text-green-600 hover:text-green-800 dark:hover:text-green-300'}`}
                            title={u.is_active ? 'Désactiver' : 'Activer'}
                          >
                            {u.is_active ? <Power className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </button>
                        )}
                        {!u.is_superuser && (
                          <button
                            type="button"
                            onClick={() => setToDelete(u)}
                            className="rounded p-1.5 text-red-400 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/40 dark:hover:text-red-300"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal détail / modification */}
      <UserDetailModal
        user={viewing}
        onClose={() => setViewing(null)}
        onSaved={() => {
          load()
        }}
      />

      {/* Modal suppression */}
      <Modal open={!!toDelete} onClose={() => setToDelete(null)}>
        <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">Supprimer ce compte ?</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Confirmer la suppression définitive de{' '}
          <span className="font-medium text-slate-900 dark:text-slate-100">{toDelete?.email}</span> ? Cette action est irréversible.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setToDelete(null)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-gray-600 dark:text-slate-200 dark:hover:bg-gray-700"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-70"
          >
            <Trash2 className="h-4 w-4" />
            {busy ? 'Suppression…' : 'Supprimer'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
