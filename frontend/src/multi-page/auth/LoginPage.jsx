import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, Mail, Lock, GraduationCap, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { setAuth } from '../../auth'
import { ThemeToggle } from '../../components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
        setError(data.detail || 'Connexion impossible. Vérifiez vos identifiants.')
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
    } catch {
      setError('Erreur réseau. Impossible de joindre le serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8B3A3D]/5 via-background to-background text-foreground flex flex-col justify-between">
      <header className="border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="group flex items-center gap-2.5 font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B3A3D] to-[#C45C26] text-white shadow-md shadow-[#8B3A3D]/20">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-base font-extrabold bg-gradient-to-r from-[#8B3A3D] to-[#C45C26] bg-clip-text text-transparent">
              ESI Online
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link to="/" className="flex items-center gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" /> Accueil
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-10">
        <Card className="shadow-xl border-border/80 overflow-hidden animate-slide-up">
          <div className="h-2 bg-gradient-to-r from-[#8B3A3D] via-[#A8483B] to-[#C45C26]" />
          <CardHeader className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-[#8B3A3D]/15 to-[#C45C26]/15 p-3 text-[#8B3A3D] dark:text-orange-400">
                <LogIn className="h-6 w-6" strokeWidth={2} />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Espace Connexion</CardTitle>
                <CardDescription className="text-xs">Accédez à votre compte ESI Online sécurisé</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="py-2.5">
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">Adresse e-mail universitaire</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="etudiant@esi.dz"
                    required
                    autoComplete="email"
                    disabled={loading}
                    className="pl-10 h-10 text-sm focus-visible:ring-[#8B3A3D]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold">Mot de passe</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    disabled={loading}
                    className="pl-10 pr-10 h-10 text-sm focus-visible:ring-[#8B3A3D]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded focus:outline-none"
                    title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                    ) : (
                      <Eye className="h-4 w-4" strokeWidth={1.75} />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-[#8B3A3D] to-[#C45C26] hover:from-[#722F31] hover:to-[#A34D1F] text-white font-bold shadow-md shadow-[#8B3A3D]/25 transition-all mt-2"
                size="lg"
              >
                <LogIn className="h-4 w-4" /> {loading ? 'Vérification en cours…' : 'Se connecter'}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t text-center text-xs text-muted-foreground">
              Vous n'avez pas encore d'identifiant ?{' '}
              <Link to="/inscription" className="font-bold text-[#C45C26] hover:underline">
                Créer un compte
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t border-border/80 bg-background/80 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ESI Online — Portail officiel de l'École Supérieure d'Informatique
      </footer>
    </div>
  )
}

