import { useState } from 'react'
import { X, Pencil, Save } from 'lucide-react'
import { fetchWithAuth } from '../../auth'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

const ROLE_LABELS = {
  admin: 'Super admin',
  admin_ecole: 'Admin école',
  professeur: 'Professeur',
  bibliothecaire: 'Bibliothécaire',
  user: 'Étudiant',
}

export default function UserDetailModal({ user, onClose, onSaved }) {
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [display, setDisplay] = useState(user)
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    username: user?.username || '',
    is_active: user?.is_active ?? true,
    password: '',
  })

  if (!user) return null

  const current = display || user

  function startEdit() {
    setForm({
      first_name: current.first_name || '',
      last_name: current.last_name || '',
      email: current.email || '',
      username: current.username || '',
      is_active: current.is_active ?? true,
      password: '',
    })
    setEditing(true)
    setError('')
    setMsg('')
  }

  async function handleSave(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setMsg('')
    try {
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        username: form.username.trim(),
        is_active: form.is_active,
      }
      if (form.password) payload.password = form.password
      const res = await fetchWithAuth(API_BASE, `${API_BASE}/api/auth/users/${user.id}/update/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const first = Object.values(data)[0]
        setError(Array.isArray(first) ? first.join(' ') : data.detail || 'Erreur lors de la mise à jour.')
        setBusy(false)
        return
      }
      setMsg('Modifications enregistrées.')
      onSaved && onSaved(data)
      setDisplay((prev) => ({ ...(prev || user), ...data }))
      setBusy(false)
      setEditing(false)
      setTimeout(() => setMsg(''), 2500)
    } catch {
      setError('Erreur réseau.')
      setBusy(false)
    }
  }

  const fieldClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-slate-100'
  const labelClass = 'mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {editing ? `Modifier ${current.email}` : 'Détails du compte'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-gray-700 dark:hover:text-slate-200"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {current.role && (
          <div className="mt-3">
            <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 dark:bg-gray-700 dark:text-slate-200">
              {ROLE_LABELS[current.role] || current.role}
            </span>
          </div>
        )}

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-300">
            {error}
          </div>
        )}
        {msg && (
          <div className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/40 dark:text-green-300">
            {msg}
          </div>
        )}

        {!editing ? (
          <div className="mt-4 divide-y divide-slate-100 dark:divide-gray-700">
            <Row label="ID" value={current.id} />
            <Row label="Nom" value={current.last_name} />
            <Row label="Prénom" value={current.first_name} />
            <Row label="Email" value={current.email} />
            <Row label="Nom d'utilisateur" value={current.username} />
            {current.classe_libelle && <Row label="Classe" value={current.classe_libelle} />}
            {current.poste && <Row label="Poste" value={current.poste} />}
            <Row
              label="Statut"
              value={
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${current.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-slate-400'}`}>
                  {current.is_active ? 'Actif' : 'Inactif'}
                </span>
              }
            />
            {current.date_joined && (
              <Row label="Inscription" value={new Date(current.date_joined).toLocaleDateString('fr-FR')} />
            )}
          </div>
        ) : (
          <form onSubmit={handleSave} className="mt-4 space-y-4">
            <div>
              <label className={labelClass}>Nom</label>
              <input className={fieldClass} value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Prénom</label>
              <input className={fieldClass} value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input className={fieldClass} type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Nom d'utilisateur</label>
              <input className={fieldClass} value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Mot de passe</label>
              <input
                className={fieldClass}
                type="password"
                placeholder="Laisser vide pour ne pas changer"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="rounded border-slate-300 text-[var(--color-esi-primary)] focus:ring-[var(--color-esi-primary)]"
              />
              Compte actif
            </label>
          </form>
        )}

        <div className="mt-5 flex justify-end gap-2">
          {!editing ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-gray-600 dark:text-slate-200 dark:hover:bg-gray-700"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={startEdit}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-esi-primary)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--color-esi-primary-hover)]"
              >
                <Pencil className="h-4 w-4" />
                Modifier
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { setEditing(false); setError(''); setMsg('') }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-gray-600 dark:text-slate-200 dark:hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-70"
              >
                <Save className="h-4 w-4" />
                {busy ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-right text-slate-800 dark:text-slate-200">{value || '—'}</span>
    </div>
  )
}
