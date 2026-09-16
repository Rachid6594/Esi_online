import { useState, useEffect } from 'react'
import { Building2, UserPlus } from 'lucide-react'
import { getAccessToken, refreshAccessToken, clearAuthAndRedirectToLogin } from '../../auth'
import { Button } from '@/components/ui/button'

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
    if (!r) throw new Error('Non autoris�')
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
      setMsg({ type: 'error', text: 'Le mot de passe doit contenir au moins 8 caract�res.' })
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
        setMsg({ type: 'success', text: 'Compte administration cr��. La personne peut se connecter avec cet email et ce mot de passe.' })
        setForm((f) => ({ ...f, email: '', password: '', passwordConfirm: '', phone: '', matricule: '', poste: '', departement: '', bureau: '', droitIds: [] }))
        return apiGet('/administrationecoles/')
      })
      .then((admins) => setList(Array.isArray(admins) ? admins : []))
      .catch((err) => setMsg({ type: 'error', text: err?.message || 'Erreur cr�ation.' }))
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

  // Grouper par domaine pour afficher C, R, U, D par r�le
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
        <div className="rounded-xl bg-muted p-2.5 text-foreground">
          <Building2 className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Gestion de l&apos;administration</h1>
          <p className="text-muted-foreground">Cr�er et g�rer les comptes administration (�coles, services) et leurs droits.</p>
        </div>
      </div>

      {msg.text && (
        <div
          className={`mb-4 rounded-lg border px-4 py-2 text-sm ${
            msg.type === 'error'
              ? 'border-destructive/30 bg-destructive/10 text-destructive'
              : 'border-border bg-muted text-foreground'
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <UserPlus className="h-5 w-5" />
            Cr�er un compte administration
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Saisissez l&apos;email et le mot de passe pour que la personne puisse se connecter. Pour chaque r�le, cochez C (Cr�er), R (Lire), U (Modifier), D (Supprimer) selon les besoins.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Email de connexion *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                placeholder="exemple@esi.dz"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Mot de passe * (min. 8 caract�res)</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                placeholder="��������"
                minLength={8}
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Confirmer le mot de passe *</label>
              <input
                type="password"
                value={form.passwordConfirm}
                onChange={(e) => setForm((f) => ({ ...f, passwordConfirm: e.target.value }))}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                placeholder="��������"
                minLength={8}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">T�l�phone (optionnel)</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                placeholder="+33..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Matricule *</label>
              <input
                value={form.matricule}
                onChange={(e) => setForm((f) => ({ ...f, matricule: e.target.value }))}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                placeholder="Ex. ADM001"
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Poste *</label>
              <input
                value={form.poste}
                onChange={(e) => setForm((f) => ({ ...f, poste: e.target.value }))}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                placeholder="Ex. Secr�tariat"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">D�partement (optionnel)</label>
              <input
                value={form.departement}
                onChange={(e) => setForm((f) => ({ ...f, departement: e.target.value }))}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                placeholder="Ex. Scolarit�"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Bureau (optionnel)</label>
            <input
              value={form.bureau}
              onChange={(e) => setForm((f) => ({ ...f, bureau: e.target.value }))}
              className="w-full max-w-xs rounded-lg border border-border px-3 py-2 text-sm"
              placeholder="Ex. B�t. A"
            />
          </div>
          {domainesList.length > 0 && (
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Droits par r�le (C = Cr�er, R = Lire, U = Modifier, D = Supprimer)</span>
                <button
                  type="button"
                  onClick={selectAllDroits}
                  className="rounded border border-border bg-muted px-2 py-1 text-xs font-medium text-foreground hover:bg-muted"
                >
                  Tout s�lectionner (tous les r�les)
                </button>
                <button
                  type="button"
                  onClick={deselectAllDroits}
                  className="rounded border border-border bg-muted px-2 py-1 text-xs font-medium text-foreground hover:bg-muted"
                >
                  Tout d�s�lectionner (tous les r�les)
                </button>
              </div>
              <div className="space-y-3">
                {domainesList.map(({ domaine, libelleBase, items }) => (
                  <div key={domaine} className="rounded-lg border border-border p-3">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">{libelleBase}</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => selectAllCrudForDomaine(items)}
                          className="rounded border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted "
                        >
                          Tout s�lectionner (C,R,U,D)
                        </button>
                        <button
                          type="button"
                          onClick={() => deselectAllCrudForDomaine(items)}
                          className="rounded border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted "
                        >
                          Tout d�s�lectionner
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
                              className="rounded border-border text-foreground"
                            />
                            <span className="text-muted-foreground">{letter}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Cr�ation...' : 'Cr�er le compte'}
          </Button>
        </form>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold text-foreground">Comptes administration ({list.length})</h2>
        </div>
        <div className="overflow-x-auto p-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement...</p>
          ) : list.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun compte. Cr�ez-en un ci-dessus.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2">ID</th>
                  <th className="py-2">Matricule</th>
                  <th className="py-2">Poste</th>
                  <th className="py-2">D�partement</th>
                  <th className="py-2">Droits</th>
                </tr>
              </thead>
              <tbody>
                {list.map((a) => (
                  <tr key={a.id} className="border-b border-border">
                    <td className="py-2">{a.id}</td>
                    <td className="py-2">{a.matricule ?? '�'}</td>
                    <td className="py-2">{a.poste ?? '�'}</td>
                    <td className="py-2">{a.departement ?? '�'}</td>
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
                        : '�'}
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
