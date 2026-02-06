import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, ArrowLeft } from 'lucide-react'
import { fetchWithAuth } from '../../auth'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

function formatValidationErrors(err) {
  if (typeof err === 'string') return err
  if (err && typeof err === 'object') {
    const parts = []
    for (const [k, v] of Object.entries(err)) {
      const msg = Array.isArray(v) ? v.join(' ') : String(v)
      if (msg) parts.push(msg)
    }
    return parts.length ? parts.join(' ') : 'Erreur de validation.'
  }
  return 'Erreur de validation.'
}

export default function AdminBibliothecairesCreation() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [first_name, setFirst_name] = useState('')
  const [last_name, setLast_name] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleSubmit(e) {
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
    setLoading(true)
    fetchWithAuth(API_BASE, `${API_BASE}/api/auth/bibliothecaires/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        password,
      }),
    })
      .then((r) => {
        if (!r) return
        if (r.ok) return r.json()
        return r.json().then((data) => Promise.reject(data))
      })
      .then((data) => {
        setSuccess(data?.message || 'Compte bibliothécaire créé.')
        setEmail('')
        setFirst_name('')
        setLast_name('')
        setPassword('')
        setConfirmPassword('')
        setTimeout(() => navigate('/admin/bibliothecaires/liste'), 1500)
      })
      .catch((err) => {
        setError(err?.detail || formatValidationErrors(err?.email || err) || 'Erreur lors de la création.')
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)]">
          <UserPlus className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Créer un compte bibliothécaire</h1>
          <p className="text-slate-600">Saisissez l&apos;email, le nom et un mot de passe pour le nouveau compte.</p>
        </div>
      </div>

      <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <Link
          to="/admin/bibliothecaires/liste"
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[var(--color-esi-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </Link>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              {success}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="bibliothecaire@exemple.com"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="first_name" className="mb-1 block text-sm font-medium text-slate-700">
                Prénom
              </label>
              <input
                id="first_name"
                type="text"
                value={first_name}
                onChange={(e) => setFirst_name(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Prénom"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="mb-1 block text-sm font-medium text-slate-700">
                Nom
              </label>
              <input
                id="last_name"
                type="text"
                value={last_name}
                onChange={(e) => setLast_name(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Nom"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Au moins 8 caractères"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-slate-700">
              Confirmer le mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Repéter le mot de passe"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-esi-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-esi-primary-hover)] disabled:opacity-70"
            >
              {loading ? 'Création…' : 'Créer le compte'}
            </button>
            <Link
              to="/admin/bibliothecaires/liste"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
