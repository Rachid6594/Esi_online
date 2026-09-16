import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, Mail, Lock, GraduationCap } from 'lucide-react'
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
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span>ESI Online</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">Retour à l&apos;accueil</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-140px)] max-w-md flex-col justify-center px-4 py-12">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-muted p-2.5 text-foreground">
                <LogIn className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <div>
                <CardTitle className="text-xl">Connexion</CardTitle>
                <CardDescription>Accédez à votre espace ESI Online</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Adresse e-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    required
                    autoComplete="email"
                    disabled={loading}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    disabled={loading}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                <LogIn className="h-4 w-4" /> {loading ? 'Connexion…' : 'Se connecter'}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Pas encore de compte ?{' '}
              <Link to="/inscription" className="font-medium text-primary hover:underline">
                S&apos;inscrire
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t bg-card py-6 text-center text-sm text-muted-foreground">
        © ESI Online — École Supérieure d&apos;Informatique
      </footer>
    </div>
  )
}
