import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, Mail, Lock, Shield } from 'lucide-react'
import { setAdminToken } from './adminAuth'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    // TODO: remplacer par appel API backend (création compte admin côté backend)
    // Pour l'instant on accepte un couple email/password pour démo
    if (!email.trim() || !password) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    // Simule une connexion réussie ; plus tard : POST /api/admin/login
    setAdminToken('admin-' + Date.now())
    navigate('/admin', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="font-semibold text-slate-800">
            <span className="text-[var(--color-esi-primary)]">ESI</span> Online
          </Link>
          <Link to="/" className="text-sm text-slate-600 hover:text-[var(--color-esi-primary)]">
            Retour au site
          </Link>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-140px)] max-w-md flex-col justify-center px-4 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-xl bg-[var(--color-esi-primary-light)] p-2.5 text-[var(--color-esi-primary)]">
              <Shield className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Espace Admin</h1>
              <p className="text-sm text-slate-600">Connexion réservée aux administrateurs</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={1.5} />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@esi.bf"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-slate-800 placeholder-slate-400 focus:border-[var(--color-esi-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-esi-primary)]/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={1.5} />
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-slate-800 placeholder-slate-400 focus:border-[var(--color-esi-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-esi-primary)]/20"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-esi-primary)] py-3 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-esi-primary-hover)]"
            >
              <LogIn className="h-4 w-4" /> Se connecter
            </button>
          </form>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        © ESI Online — Espace Admin
      </footer>
    </div>
  )
}
