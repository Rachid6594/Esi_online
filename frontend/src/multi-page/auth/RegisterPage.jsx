import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, Mail, Lock, User, GraduationCap } from 'lucide-react'
import { ThemeToggle } from '../../components/ThemeToggle'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data.email) setError(Array.isArray(data.email) ? data.email[0] : 'Cet email est déjà utilisé.')
        else if (data.username) setError(Array.isArray(data.username) ? data.username[0] : "Ce nom d'utilisateur est déjà pris.")
        else if (data.password) setError(Array.isArray(data.password) ? data.password[0] : 'Mot de passe invalide.')
        else setError(data.detail || 'Inscription impossible.')
        return
      }
      setSuccess(true)
    } catch {
      setError('Erreur réseau. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800 dark:bg-gray-900 dark:text-slate-200">
        <header className="border-b border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-esi-primary)] text-white">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span>
                <span className="text-[var(--color-esi-primary)]">ESI</span> Online
              </span>
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-gray-600 dark:bg-gray-800">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <UserPlus className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <p className="font-medium text-green-700 dark:text-green-400">Compte créé !</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Votre inscription a bien été enregistrée. Vous pouvez maintenant vous connecter.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block rounded-xl bg-[var(--color-esi-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-esi-primary-hover)]"
            >
              Se connecter
            </Link>
          </div>
        </main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-400">
          © ESI Online — École Supérieure d&apos;Informatique
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 dark:bg-gray-900 dark:text-slate-200">
      <header className="border-b border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-esi-primary)] text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span>
              <span className="text-[var(--color-esi-primary)]">ESI</span> Online
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/" className="text-sm text-slate-600 hover:text-[var(--color-esi-primary)] dark:text-slate-300 dark:hover:text-white">
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-140px)] max-w-md flex-col justify-center px-4 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-gray-600 dark:bg-gray-800">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)] dark:bg-gray-700 dark:text-esi-orange">
              <UserPlus className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Inscription</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">Créez votre compte ESI Online</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Nom d&apos;utilisateur
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ex. j.ahmed"
                  required
                  autoComplete="username"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-slate-800 placeholder-slate-400 focus:border-[var(--color-esi-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-esi-primary)]/20 disabled:opacity-70 dark:border-gray-600 dark:bg-gray-700 dark:text-slate-100 dark:placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  required
                  autoComplete="email"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-slate-800 placeholder-slate-400 focus:border-[var(--color-esi-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-esi-primary)]/20 disabled:opacity-70 dark:border-gray-600 dark:bg-gray-700 dark:text-slate-100 dark:placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 caractères"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-slate-800 placeholder-slate-400 focus:border-[var(--color-esi-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-esi-primary)]/20 disabled:opacity-70 dark:border-gray-600 dark:bg-gray-700 dark:text-slate-100 dark:placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-slate-800 placeholder-slate-400 focus:border-[var(--color-esi-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-esi-primary)]/20 disabled:opacity-70 dark:border-gray-600 dark:bg-gray-700 dark:text-slate-100 dark:placeholder-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-esi-primary)] py-3 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-esi-primary-hover)] disabled:opacity-70"
            >
              <UserPlus className="h-4 w-4" /> {loading ? 'Inscription…' : 'Créer mon compte'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
            Déjà inscrit ?{' '}
            <Link to="/login" className="font-medium text-[var(--color-esi-primary)] hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-400">
        © ESI Online — École Supérieure d&apos;Informatique
      </footer>
    </div>
  )
}
