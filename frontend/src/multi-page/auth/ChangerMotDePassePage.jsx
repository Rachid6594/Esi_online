import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Lock } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export default function ChangerMotDePassePage() {
  const [searchParams] = useSearchParams()
  const uid = searchParams.get('uid') ?? ''
  const token = searchParams.get('token') ?? ''

  const [status, setStatus] = useState('loading') // loading | valid | invalid | success | error
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!uid || !token) {
      setStatus('invalid')
      return
    }
    let cancelled = false
    fetch(`${API_BASE}/api/auth/invitation/validate/?uid=${encodeURIComponent(uid)}&token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        if (data.valid && data.email) {
          setEmail(data.email)
          setStatus('valid')
        } else {
          setStatus('invalid')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('invalid')
      })
    return () => { cancelled = true }
  }, [uid, token])

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) {
      setMessage('Les deux mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 8) {
      setMessage('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setMessage('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/invitation/set-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, token, new_password: password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage(data.detail || 'Erreur. Réessayez ou demandez un nouveau lien.')
        return
      }
      setStatus('success')
    } catch (err) {
      setMessage('Erreur réseau.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <p className="text-slate-600">Vérification du lien…</p>
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-800">Ce lien est invalide ou a expiré.</p>
          <p className="mt-2 text-sm text-slate-600">
            Demandez un nouveau lien à l&apos;administrateur ou connectez-vous si vous avez déjà défini votre mot de passe.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block rounded-xl bg-[var(--color-esi-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-esi-primary-hover)]"
          >
            Aller à la connexion
          </Link>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="font-medium text-green-700">Mot de passe mis à jour.</p>
          <p className="mt-2 text-sm text-slate-600">Vous pouvez maintenant vous connecter avec votre email et ce mot de passe.</p>
          <Link
            to="/login"
            className="mt-6 inline-block rounded-xl bg-[var(--color-esi-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-esi-primary-hover)]"
          >
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)]">
            <Lock className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Changer votre mot de passe</h1>
            <p className="text-sm text-slate-600">{email}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{message}</div>
          )}
          <div>
            <label htmlFor="new_password" className="mb-1 block text-sm font-medium text-slate-700">
              Nouveau mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              id="new_password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-4 pr-4 text-slate-800 focus:border-[var(--color-esi-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-esi-primary)]/20"
            />
            <p className="mt-1 text-xs text-slate-500">Minimum 8 caractères.</p>
          </div>
          <div>
            <label htmlFor="confirm" className="mb-1 block text-sm font-medium text-slate-700">
              Confirmer le mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-4 pr-4 text-slate-800 focus:border-[var(--color-esi-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-esi-primary)]/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--color-esi-primary)] py-3 text-sm font-medium text-white hover:bg-[var(--color-esi-primary-hover)] disabled:opacity-70"
          >
            {loading ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          <Link to="/login" className="text-[var(--color-esi-primary)] hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  )
}
