import { useState, useEffect } from 'react'
import { Settings, Shield } from 'lucide-react'
import { getAccessToken, refreshAccessToken, clearAuthAndRedirectToLogin } from '../../auth'

const API_BASE = import.meta.env.VITE_API_URL ?? ''
const ETABLISSEMENT = `${API_BASE}/api/etablissement`

async function fetchWithAuth(url, options = {}, isRetry = false) {
  const token = getAccessToken()
  const headers = { ...options.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  const res = await fetch(url, { ...options, headers })
  if (res.status === 401 && !isRetry) {
    const refreshed = await refreshAccessToken(API_BASE)
    if (refreshed) return fetchWithAuth(url, options, true)
    clearAuthAndRedirectToLogin()
    return
  }
  return res
}

function apiGet(path) {
  return fetchWithAuth(`${ETABLISSEMENT}${path}`).then(async (r) => {
    if (!r) return []
    const text = await r.text()
    let data
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = null
    }
    if (r.ok) return Array.isArray(data) ? data : data?.results ?? data ?? []
    return Promise.reject(new Error('Erreur chargement'))
  })
}

function apiPost(path, body) {
  return fetchWithAuth(`${ETABLISSEMENT}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(async (r) => {
    if (!r) throw new Error('Non autorisé')
    const data = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(data.detail ?? data.message ?? 'Erreur')
    return data
  })
}

function apiPatch(path, body) {
  return fetchWithAuth(`${ETABLISSEMENT}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(async (r) => {
    if (!r) throw new Error('Non autorisé')
    const data = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(data.detail ?? data.message ?? 'Erreur')
    return data
  })
}

function apiDelete(path) {
  return fetchWithAuth(`${ETABLISSEMENT}${path}`, { method: 'DELETE' }).then((r) => {
    if (!r) throw new Error('Non autorisé')
    if (!r.ok) return r.json().then((d) => Promise.reject(new Error(d.detail ?? 'Erreur')))
    return null
  })
}

export default function AdminParametres() {
  const [droits, setDroits] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [form, setForm] = useState({ code: '', libelle: '', ordre: 0 })
  const [submitting, setSubmitting] = useState(false)

  function loadDroits() {
    setLoading(true)
    apiGet('/droitadministrations/')
      .then((data) => setDroits(Array.isArray(data) ? data : []))
      .catch(() => setMsg({ type: 'error', text: 'Impossible de charger les droits.' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadDroits()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.code?.trim() || !form.libelle?.trim()) {
      setMsg({ type: 'error', text: 'Code et libellé sont requis.' })
      return
    }
    setSubmitting(true)
    setMsg({ type: '', text: '' })
    apiPost('/droitadministrations/', {
      code: form.code.trim(),
      libelle: form.libelle.trim(),
      ordre: form.ordre || 0,
    })
      .then(() => {
        setMsg({ type: 'success', text: 'Rôle créé (4 sous-droits C, R, U, D).' })
        setForm({ code: '', libelle: '', ordre: droits.length * 10 })
        loadDroits()
      })
      .catch((err) => setMsg({ type: 'error', text: err?.message ?? 'Erreur.' }))
      .finally(() => setSubmitting(false))
  }

  const handleDeleteOne = (id) => {
    if (!window.confirm('Supprimer ce droit ?')) return
    apiDelete(`/droitadministrations/${id}/`)
      .then(() => {
        setMsg({ type: 'success', text: 'Droit supprimé.' })
        loadDroits()
      })
      .catch((err) => setMsg({ type: 'error', text: err?.message ?? 'Erreur.' }))
  }

  const handleDeleteRole = (ids) => {
    if (!window.confirm('Supprimer tout le rôle (les 4 sous-droits C, R, U, D) ?')) return
    Promise.all(ids.map((id) => apiDelete(`/droitadministrations/${id}/`)))
      .then(() => {
        setMsg({ type: 'success', text: 'Rôle supprimé.' })
        loadDroits()
      })
      .catch((err) => setMsg({ type: 'error', text: err?.message ?? 'Erreur.' }))
  }

  const ACTION_ORDER = ['create', 'read', 'update', 'delete']
  const droitsByDomaine = droits
    .filter((d) => d.domaine)
    .reduce((acc, d) => {
      const key = d.domaine
      if (!acc[key]) acc[key] = []
      acc[key].push(d)
      return acc
    }, {})
  Object.keys(droitsByDomaine || {}).forEach((key) => {
    droitsByDomaine[key].sort((a, b) => ACTION_ORDER.indexOf(a.action) - ACTION_ORDER.indexOf(b.action))
  })
  const domainesList = Object.entries(droitsByDomaine || {}).map(([domaine, items]) => {
    const libelleBase = (items[0]?.libelle || domaine).replace(/\s*\((C|R|U|D)\)\s*$/, '').trim()
    return { domaine, libelleBase, items }
  })

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)]">
          <Settings className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Paramètres</h1>
          <p className="text-slate-600 dark:text-slate-400">Configuration générale de la plateforme ESI Online.</p>
        </div>
      </div>

      {msg.text && (
        <div
          className={`mb-4 rounded-lg border px-4 py-2 text-sm ${
            msg.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200'
              : 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200'
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-slate-200 p-4 dark:border-gray-700">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
            <Shield className="h-5 w-5" />
            Droits d&apos;administration
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Chaque rôle créé génère 4 sous-droits CRUD (C = Créer, R = Lire, U = Modifier, D = Supprimer) que vous pourrez attribuer finement aux comptes administration.
          </p>
        </div>
        <div className="p-4">
          <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Code du rôle *</label>
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="Ex. peut_gerer_prof"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm min-w-[200px] dark:border-gray-600 dark:bg-gray-700 dark:text-slate-100"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Libellé *</label>
              <input
                value={form.libelle}
                onChange={(e) => setForm((f) => ({ ...f, libelle: e.target.value }))}
                placeholder="Ex. Gérer les emplois du temps"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm min-w-[220px] dark:border-gray-600 dark:bg-gray-700 dark:text-slate-100"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Ordre</label>
              <input
                type="number"
                value={form.ordre}
                onChange={(e) => setForm((f) => ({ ...f, ordre: parseInt(e.target.value, 10) || 0 }))}
                className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-slate-100"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[var(--color-esi-primary)] px-4 py-2 text-sm text-white hover:bg-[var(--color-esi-primary-hover)] disabled:opacity-70"
            >
              {submitting ? 'Création...' : 'Créer le rôle (4 sous-droits C, R, U, D)'}
            </button>
          </form>

          {loading ? (
            <p className="text-sm text-slate-500">Chargement...</p>
          ) : domainesList.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Aucun rôle défini. Créez-en un ci-dessus (4 sous-droits C, R, U, D seront créés).</p>
          ) : (
            <div className="space-y-4">
              {domainesList.map(({ domaine, libelleBase, items }) => (
                <div key={domaine} className="rounded-lg border border-slate-200 p-3 dark:border-gray-600">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{libelleBase}</span>
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{domaine}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    {items.map((d) => (
                      <span key={d.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        {d.action === 'create' ? 'C' : d.action === 'read' ? 'R' : d.action === 'update' ? 'U' : 'D'}
                        <button
                          type="button"
                          onClick={() => handleDeleteOne(d.id)}
                          className="text-red-500 hover:underline"
                          title="Supprimer ce sous-droit"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleDeleteRole(items.map((i) => i.id))}
                      className="text-red-600 hover:underline dark:text-red-400"
                    >
                      Supprimer le rôle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Autres paramètres (préférences, notifications, maintenance) à venir.
        </p>
      </div>
    </div>
  )
}
