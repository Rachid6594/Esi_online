import { useState, useEffect } from 'react'
import { Building2, UserPlus } from 'lucide-react'
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
    const msg = data?.detail ?? data?.message ?? `Erreur ${r.status}`
    return Promise.reject(new Error(typeof msg === 'string' ? msg : msg[0]))
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
    if (!r.ok) {
      const msg = data.detail ?? data.message ?? (data.droits && data.droits[0]) ?? 'Erreur'
      return Promise.reject(new Error(typeof msg === 'string' ? msg : msg[0]))
    }
    return data
  })
}

export default function AdminAdministration() {
  const [list, setList] = useState([])
  const [droits, setDroits] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [form, setForm] = useState({
    role: 'admin_ecole',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    matricule: '',
    poste: '',
    departement: '',
    bureau: '',
    droitIds: [],
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      apiGet('/administrationecoles/'),
      apiGet('/droitadministrations/'),
    ])
      .then(([admins, droitsList]) => {
        setList(Array.isArray(admins) ? admins : [])
        setDroits(Array.isArray(droitsList) ? droitsList : [])
      })
      .catch((err) => setMsg({ type: 'error', text: err?.message || 'Erreur chargement.' }))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.email?.trim()) {
      setMsg({ type: 'error', text: 'L\'email est requis pour la connexion.' })
      return
    }
    if (!form.password || form.password.length < 8) {
      setMsg({ type: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères.' })
      return
    }
    if (form.password !== form.passwordConfirm) {
      setMsg({ type: 'error', text: 'Les deux mots de passe ne correspondent pas.' })
      return
    }
    if (!form.matricule?.trim() || !form.poste?.trim()) {
      setMsg({ type: 'error', text: 'Matricule et poste sont requis.' })
      return
    }
    setSubmitting(true)
    setMsg({ type: '', text: '' })
    apiPost('/administrationecoles/', {
      user_data: {
        role: form.role || 'admin_ecole',
        email: form.email.trim(),
        password: form.password,
        phone: form.phone || '',
        is_active: true,
      },
      matricule: form.matricule.trim(),
      poste: form.poste.trim(),
      departement: form.departement?.trim() || null,
      bureau: form.bureau?.trim() || null,
      droits: form.droitIds,
    })
      .then(() => {
        setMsg({ type: 'success', text: 'Compte administration créé. La personne peut se connecter avec cet email et ce mot de passe.' })
        setForm((f) => ({ ...f, email: '', password: '', passwordConfirm: '', phone: '', matricule: '', poste: '', departement: '', bureau: '', droitIds: [] }))
        return apiGet('/administrationecoles/')
      })
      .then((admins) => setList(Array.isArray(admins) ? admins : []))
      .catch((err) => setMsg({ type: 'error', text: err?.message || 'Erreur création.' }))
      .finally(() => setSubmitting(false))
  }

  const toggleDroit = (id) => {
    setForm((f) => ({
      ...f,
      droitIds: f.droitIds.includes(id) ? f.droitIds.filter((d) => d !== id) : [...f.droitIds, id],
    }))
  }

  const selectAllDroits = () => {
    const allIds = domainesList.flatMap(({ items }) => items.map((d) => d.id))
    setForm((f) => ({ ...f, droitIds: [...new Set([...f.droitIds, ...allIds])] }))
  }

  const selectAllCrudForDomaine = (items) => {
    const ids = items.map((d) => d.id)
    setForm((f) => ({ ...f, droitIds: [...new Set([...f.droitIds, ...ids])] }))
  }

  const deselectAllDroits = () => {
    const allIds = domainesList.flatMap(({ items }) => items.map((d) => d.id))
    setForm((f) => ({ ...f, droitIds: f.droitIds.filter((id) => !allIds.includes(id)) }))
  }

  const deselectAllCrudForDomaine = (items) => {
    const ids = items.map((d) => d.id)
    setForm((f) => ({ ...f, droitIds: f.droitIds.filter((id) => !ids.includes(id)) }))
  }

  // Grouper par domaine pour afficher C, R, U, D par rôle
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
          <Building2 className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Gestion de l&apos;administration</h1>
          <p className="text-slate-600 dark:text-slate-400">Créer et gérer les comptes administration (écoles, services) et leurs droits.</p>
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
            <UserPlus className="h-5 w-5" />
            Créer un compte administration
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Saisissez l&apos;email et le mot de passe pour que la personne puisse se connecter. Pour chaque rôle, cochez C (Créer), R (Lire), U (Modifier), D (Supprimer) selon les besoins.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Email de connexion *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-slate-100"
                placeholder="exemple@esi.dz"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Mot de passe * (min. 8 caractères)</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-slate-100"
                placeholder="••••••••"
                minLength={8}
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Confirmer le mot de passe *</label>
              <input
                type="password"
                value={form.passwordConfirm}
                onChange={(e) => setForm((f) => ({ ...f, passwordConfirm: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-slate-100"
                placeholder="••••••••"
                minLength={8}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Téléphone (optionnel)</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-slate-100"
                placeholder="+33..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Matricule *</label>
              <input
                value={form.matricule}
                onChange={(e) => setForm((f) => ({ ...f, matricule: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-slate-100"
                placeholder="Ex. ADM001"
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Poste *</label>
              <input
                value={form.poste}
                onChange={(e) => setForm((f) => ({ ...f, poste: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-slate-100"
                placeholder="Ex. Secrétariat"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Département (optionnel)</label>
              <input
                value={form.departement}
                onChange={(e) => setForm((f) => ({ ...f, departement: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-slate-100"
                placeholder="Ex. Scolarité"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Bureau (optionnel)</label>
            <input
              value={form.bureau}
              onChange={(e) => setForm((f) => ({ ...f, bureau: e.target.value }))}
              className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-slate-100"
              placeholder="Ex. Bât. A"
            />
          </div>
          {domainesList.length > 0 && (
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Droits par rôle (C = Créer, R = Lire, U = Modifier, D = Supprimer)</span>
                <button
                  type="button"
                  onClick={selectAllDroits}
                  className="rounded border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-slate-300 dark:hover:bg-gray-600"
                >
                  Tout sélectionner (tous les rôles)
                </button>
                <button
                  type="button"
                  onClick={deselectAllDroits}
                  className="rounded border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-slate-300 dark:hover:bg-gray-600"
                >
                  Tout désélectionner (tous les rôles)
                </button>
              </div>
              <div className="space-y-3">
                {domainesList.map(({ domaine, libelleBase, items }) => (
                  <div key={domaine} className="rounded-lg border border-slate-200 p-3 dark:border-gray-600">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{libelleBase}</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => selectAllCrudForDomaine(items)}
                          className="rounded border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-slate-400 dark:hover:bg-gray-600"
                        >
                          Tout sélectionner (C,R,U,D)
                        </button>
                        <button
                          type="button"
                          onClick={() => deselectAllCrudForDomaine(items)}
                          className="rounded border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-slate-400 dark:hover:bg-gray-600"
                        >
                          Tout désélectionner
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {items.map((d) => {
                        const letter = d.action === 'create' ? 'C' : d.action === 'read' ? 'R' : d.action === 'update' ? 'U' : 'D'
                        return (
                          <label key={d.id} className="flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              checked={form.droitIds.includes(d.id)}
                              onChange={() => toggleDroit(d.id)}
                              className="rounded border-slate-300 text-[var(--color-esi-primary)]"
                            />
                            <span className="text-slate-600 dark:text-slate-400">{letter}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[var(--color-esi-primary)] px-4 py-2 text-sm text-white hover:bg-[var(--color-esi-primary-hover)] disabled:opacity-70"
          >
            {submitting ? 'Création...' : 'Créer le compte'}
          </button>
        </form>
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-slate-200 p-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Comptes administration ({list.length})</h2>
        </div>
        <div className="overflow-x-auto p-4">
          {loading ? (
            <p className="text-sm text-slate-500">Chargement...</p>
          ) : list.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Aucun compte. Créez-en un ci-dessus.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-600 dark:text-slate-400">
                  <th className="py-2">ID</th>
                  <th className="py-2">Matricule</th>
                  <th className="py-2">Poste</th>
                  <th className="py-2">Département</th>
                  <th className="py-2">Droits</th>
                </tr>
              </thead>
              <tbody>
                {list.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 dark:border-gray-600">
                    <td className="py-2">{a.id}</td>
                    <td className="py-2">{a.matricule ?? '—'}</td>
                    <td className="py-2">{a.poste ?? '—'}</td>
                    <td className="py-2">{a.departement ?? '—'}</td>
                    <td className="py-2">
                      {(a.droits_detail || []).length
                        ? (() => {
                            const byDomaine = (a.droits_detail || []).reduce((acc, d) => {
                              const dom = d.domaine || d.code
                              if (!acc[dom]) acc[dom] = []
                              acc[dom].push(d.action === 'create' ? 'C' : d.action === 'read' ? 'R' : d.action === 'update' ? 'U' : d.action === 'delete' ? 'D' : '')
                              return acc
                            }, {})
                            return Object.entries(byDomaine).map(([dom, letters]) => `${dom}: ${letters.filter(Boolean).join(', ')}`).join(' ; ')
                          })()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
