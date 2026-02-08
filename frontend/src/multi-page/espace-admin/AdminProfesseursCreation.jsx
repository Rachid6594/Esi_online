import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, ArrowLeft } from 'lucide-react'
import { fetchWithAuth } from '../../auth'

const API_BASE = import.meta.env.VITE_API_URL ?? ''
const ETABLISSEMENT = `${API_BASE}/api/etablissement`

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

export default function AdminProfesseursCreation() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [first_name, setFirst_name] = useState('')
  const [last_name, setLast_name] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [matiereIds, setMatiereIds] = useState([])
  const [matieres, setMatieres] = useState([])
  const [loadingMatieres, setLoadingMatieres] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchWithAuth(API_BASE, `${ETABLISSEMENT}/matieres/`)
      .then((r) => (r && r.ok ? r.json() : []))
      .then((data) => setMatieres(Array.isArray(data) ? data : []))
      .catch(() => setMatieres([]))
      .finally(() => setLoadingMatieres(false))
  }, [])

  function toggleMatiere(id) {
    setMatiereIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

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
    if (matiereIds.length === 0) {
      setError('Veuillez sélectionner au moins une matière pour ce professeur.')
      return
    }
    setLoading(true)
    fetchWithAuth(API_BASE, `${API_BASE}/api/auth/professeurs/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        password,
        matiere_ids: matiereIds,
      }),
    })
      .then((r) => {
        if (!r) return
        if (r.ok) return r.json()
        return r.json().then((data) => Promise.reject(data))
      })
      .then((data) => {
        setSuccess(data?.message || 'Compte professeur créé.')
        setEmail('')
        setFirst_name('')
        setLast_name('')
        setPassword('')
        setConfirmPassword('')
        setMatiereIds([])
        setTimeout(() => navigate('/admin/professeurs/liste'), 1500)
      })
      .catch((err) => {
        setError(err?.detail || formatValidationErrors(err?.email || err) || 'Erreur lors de la création.')
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)] dark:bg-gray-700 dark:text-esi-orange">
          <UserPlus className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Créer un compte professeur</h1>
          <p className="text-slate-600 dark:text-slate-300">Saisissez l&apos;email, le nom, un mot de passe et associez au moins une matière.</p>
        </div>
      </div>

      <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-600 dark:bg-gray-800">
        <Link
          to="/admin/professeurs/liste"
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[var(--color-esi-primary)] dark:text-slate-300 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </Link>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
              {success}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-slate-100"
              placeholder="professeur@esi.bf"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Matière(s) <span className="text-red-500">*</span>
            </label>
            {loadingMatieres ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Chargement des matières…</p>
            ) : matieres.length === 0 ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                Aucune matière disponible. Créez des matières dans Établissement → Matières avant d&apos;ajouter un professeur.
              </p>
            ) : (
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-slate-300 p-3 dark:border-gray-600 dark:bg-gray-700/50">
                {matieres.map((m) => (
                  <label key={m.id} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={matiereIds.includes(m.id)}
                      onChange={() => toggleMatiere(m.id)}
                      className="rounded border-slate-300 text-[var(--color-esi-primary)] focus:ring-[var(--color-esi-primary)]"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {m.libelle}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="first_name" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Prénom
              </label>
              <input
                id="first_name"
                type="text"
                value={first_name}
                onChange={(e) => setFirst_name(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-slate-100"
                placeholder="Prénom"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Nom
              </label>
              <input
                id="last_name"
                type="text"
                value={last_name}
                onChange={(e) => setLast_name(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-slate-100"
                placeholder="Nom"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-slate-100"
              placeholder="Au moins 8 caractères"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Confirmer le mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-slate-100"
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
              to="/admin/professeurs/liste"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-gray-600 dark:bg-gray-700 dark:text-slate-200 dark:hover:bg-gray-600"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
