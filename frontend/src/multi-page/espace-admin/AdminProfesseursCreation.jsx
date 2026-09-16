import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, ArrowLeft } from 'lucide-react'
import { fetchWithAuth } from '../../auth'
import { Button } from '@/components/ui/button'

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
      setError('Le mot de passe doit contenir au moins 8 caract�res.')
      return
    }
    if (password !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }
    if (matiereIds.length === 0) {
      setError('Veuillez s�lectionner au moins une mati�re pour ce professeur.')
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
        setSuccess(data?.message || 'Compte professeur cr��.')
        setEmail('')
        setFirst_name('')
        setLast_name('')
        setPassword('')
        setConfirmPassword('')
        setMatiereIds([])
        setTimeout(() => navigate('/admin/professeurs/liste'), 1500)
      })
      .catch((err) => {
        setError(err?.detail || formatValidationErrors(err?.email || err) || 'Erreur lors de la cr�ation.')
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-muted p-2.5 text-foreground">
          <UserPlus className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Cr�er un compte professeur</h1>
          <p className="text-muted-foreground">Saisissez l&apos;email, le nom, un mot de passe et associez au moins une mati�re.</p>
        </div>
      </div>

      <div className="max-w-xl rounded-xl border border-border bg-card p-6 shadow-sm">
        <Link
          to="/admin/professeurs/liste"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour � la liste
        </Link>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground">
              {success}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              placeholder="professeur@esi.bf"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Mati�re(s) <span className="text-red-500">*</span>
            </label>
            {loadingMatieres ? (
              <p className="text-sm text-muted-foreground">Chargement des mati�res�</p>
            ) : matieres.length === 0 ? (
              <p className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground">
                Aucune mati�re disponible. Cr�ez des mati�res dans �tablissement ? Mati�res avant d&apos;ajouter un professeur.
              </p>
            ) : (
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                {matieres.map((m) => (
                  <label key={m.id} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={matiereIds.includes(m.id)}
                      onChange={() => toggleMatiere(m.id)}
                      className="rounded border-border text-foreground focus:ring-ring"
                    />
                    <span className="text-sm text-foreground">
                      {m.libelle}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="first_name" className="mb-1 block text-sm font-medium text-foreground">
                Pr�nom
              </label>
              <input
                id="first_name"
                type="text"
                value={first_name}
                onChange={(e) => setFirst_name(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                placeholder="Pr�nom"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="mb-1 block text-sm font-medium text-foreground">
                Nom
              </label>
              <input
                id="last_name"
                type="text"
                value={last_name}
                onChange={(e) => setLast_name(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                placeholder="Nom"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-foreground">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              placeholder="Au moins 8 caract�res"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-foreground">
              Confirmer le mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              placeholder="Rep�ter le mot de passe"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Cr�ation�' : 'Cr�er le compte'}
            </Button>
            <Link
              to="/admin/professeurs/liste"
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-background"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
