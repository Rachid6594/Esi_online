import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, Mail, Lock } from 'lucide-react'
import { setAuth } from '../../auth'
import { ThemeToggle } from '../../components/ThemeToggle'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.detail || 'Connexion impossible.')
        return
      }
      setAuth(data.user, data.access, data.refresh)
      const role = data.user?.role
      if (role === 'admin') {
        navigate('/admin', { replace: true })
      } else if (role === 'admin_ecole') {
        navigate('/administration', { replace: true })
      } else if (role === 'bibliothecaire') {
        navigate('/bibliotheque', { replace: true })
      } else if (role === 'professeur') {
        navigate('/prof', { replace: true })
      } else {
        navigate('/home', { replace: true })
      }
    } catch (err) {
      setError('Erreur réseau. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 dark:bg-gray-900 dark:text-slate-200">
      <header className="border-b border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="font-semibold text-slate-800 dark:text-slate-100">
            <span className="text-[var(--color-esi-primary)]">ESI</span> Online
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
              <LogIn className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Connexion</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">Accédez à votre espace ESI Online</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                {error}
              </div>
            )}
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
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
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
              <LogIn className="h-4 w-4" /> {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-400">
        © ESI Online — École Supérieure d&apos;Informatique
      </footer>
    </div>
  )
}
