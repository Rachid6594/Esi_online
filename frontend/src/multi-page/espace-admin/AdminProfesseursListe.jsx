import { useState, useEffect } from 'react'
import { List, UserPlus, RefreshCw, X, Eye } from 'lucide-react'
import { fetchWithAuth } from '../../auth'
import UserDetailModal from './UserDetailModal'

const API_BASE = import.meta.env.VITE_API_URL ?? ''
const ETABLISSEMENT = `${API_BASE}/api/etablissement`

function formatValidationErrors(err) {
  if (typeof err === 'string') return err
  if (err && typeof err === 'object') {
    const parts = []
    for (const [, v] of Object.entries(err)) {
      const msg = Array.isArray(v) ? v.join(' ') : String(v)
      if (msg) parts.push(msg)
    }
    return parts.length ? parts.join(' ') : 'Erreur de validation.'
  }
  return 'Erreur de validation.'
}

export default function AdminProfesseursListe() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewing, setViewing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [matiereIds, setMatiereIds] = useState([])
  const [matieres, setMatieres] = useState([])
  const [loadingMatieres, setLoadingMatieres] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchWithAuth(API_BASE, `${ETABLISSEMENT}/matieres/`)
      .then((r) => (r && r.ok ? r.json() : []))
      .then((data) => setMatieres(Array.isArray(data) ? data : []))
      .catch(() => setMatieres([]))
      .finally(() => setLoadingMatieres(false))
  }, [])

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

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [search])

  function openModal() {
    setEmail('')
    setFirstName('')
    setLastName('')
    setPassword('')
    setConfirmPassword('')
    setMatiereIds([])
    setError('')
    setSuccess('')
    setModalOpen(true)
  }

  function toggleMatiere(id) {
    setMatiereIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }
    if (matiereIds.length === 0) {
      setError('Veuillez sélectionner au moins une matière pour ce professeur.')
      return
    }
    setBusy(true)
    const res = await fetchWithAuth(API_BASE, `${API_BASE}/api/auth/professeurs/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        password,
        matiere_ids: matiereIds,
      }),
    })
      .then((r) => {
        if (!r) return null
        return r.ok ? r.json() : r.json().then((data) => Promise.reject(data))
      })
      .catch((err) => {
        setError(err?.detail || formatValidationErrors(err?.email || err) || 'Erreur lors de la création.')
        return null
      })
      .finally(() => setBusy(false))
    if (!res) return
    setSuccess(res?.message || 'Compte professeur créé.')
    setEmail('')
    setFirstName('')
    setLastName('')
    setPassword('')
    setConfirmPassword('')
    setMatiereIds([])
    setTimeout(() => {
      setModalOpen(false)
      load()
    }, 1200)
  }

  const fieldClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-slate-100'
  const labelClass = 'mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300'

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)] dark:bg-gray-700 dark:text-esi-orange">
            <List className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Gestion des professeurs</h1>
            <p className="text-slate-600 dark:text-slate-300">Comptes ayant accès à l&apos;espace professeur.</p>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <input
            type="search"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-slate-100 sm:flex-none"
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
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-esi-primary)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--color-esi-primary-hover)]"
          >
            <UserPlus className="h-4 w-4" />
            Créer
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-800">
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">Chargement…</div>
        ) : list.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            Aucun professeur. Cliquez sur « Créer » pour en ajouter un.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600 dark:border-gray-600 dark:bg-gray-700/50 dark:text-slate-300">
                  <th className="px-4 py-3 font-medium">Nom</th>
                  <th className="px-4 py-3 font-medium">Prénom</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Matière(s)</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 dark:border-gray-600 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{p.last_name || '—'}</td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{p.first_name || '—'}</td>
                    <td className="px-4 py-3 text-[var(--color-esi-primary)] dark:text-esi-primary">{p.email}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {p.matieres?.length ? p.matieres.map((m) => m.libelle).join(', ') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-slate-400'}`}>
                        {p.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setViewing(p)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-gray-600 dark:bg-gray-800 dark:text-slate-200 dark:hover:bg-gray-700"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute right-3 top-3 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-gray-700 dark:hover:text-slate-200"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              <UserPlus className="h-5 w-5" />
              Créer un professeur
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-300">{error}</div>
              )}
              {success && (
                <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/40 dark:text-green-300">{success}</div>
              )}
              <div>
                <label className={labelClass}>Email <span className="text-red-500">*</span></label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} placeholder="professeur@esi.bf" />
              </div>
              <div>
                <label className={labelClass}>Matière(s) <span className="text-red-500">*</span></label>
                {loadingMatieres ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Chargement des matières…</p>
                ) : matieres.length === 0 ? (
                  <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                    Aucune matière disponible. Créez des matières dans Établissement → Matières.
                  </p>
                ) : (
                  <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-slate-300 p-3 dark:border-gray-600 dark:bg-gray-700/50">
                    {matieres.map((m) => (
                      <label key={m.id} className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={matiereIds.includes(m.id)}
                          onChange={() => toggleMatiere(m.id)}
                          className="rounded border-slate-300 text-[var(--color-esi-primary)] focus:ring-[var(--color-esi-primary)]"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{m.libelle}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Prénom</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={fieldClass} placeholder="Prénom" />
                </div>
                <div>
                  <label className={labelClass}>Nom</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={fieldClass} placeholder="Nom" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Mot de passe <span className="text-red-500">*</span></label>
                <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={fieldClass} placeholder="Au moins 8 caractères" />
              </div>
              <div>
                <label className={labelClass}>Confirmer le mot de passe <span className="text-red-500">*</span></label>
                <input type="password" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={fieldClass} placeholder="Repéter le mot de passe" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-gray-600 dark:text-slate-200 dark:hover:bg-gray-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-esi-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-esi-primary-hover)] disabled:opacity-70"
                >
                  {busy ? 'Création…' : 'Créer le compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <UserDetailModal
        user={viewing}
        onClose={() => setViewing(null)}
        onSaved={() => load()}
      />
    </div>
  )
}
