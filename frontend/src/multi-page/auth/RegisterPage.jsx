import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, Mail, Lock, User, GraduationCap } from 'lucide-react'
import { ThemeToggle } from '../../components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

function AuthShell({ children }) {
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
      {children}
      <footer className="border-t bg-card py-6 text-center text-sm text-muted-foreground">
        © ESI Online — École Supérieure d&apos;Informatique
      </footer>
    </div>
  )
}

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
      <AuthShell>
        <main className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md text-center shadow-sm">
            <CardContent className="pt-8">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-foreground">
                <UserPlus className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <p className="font-medium">Compte créé !</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Votre inscription a bien été enregistrée. Vous pouvez maintenant vous connecter.
              </p>
              <Button className="mt-6" asChild>
                <Link to="/login">Se connecter</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <main className="mx-auto flex min-h-[calc(100vh-140px)] max-w-md flex-col justify-center px-4 py-12">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-muted p-2.5 text-foreground">
                <UserPlus className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <div>
                <CardTitle className="text-xl">Inscription</CardTitle>
                <CardDescription>Créez votre compte ESI Online</CardDescription>
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
                <Label htmlFor="username">Nom d&apos;utilisateur</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ex. j.ahmed"
                    required
                    autoComplete="username"
                    disabled={loading}
                    className="pl-10"
                  />
                </div>
              </div>

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
                    placeholder="Minimum 8 caractères"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    disabled={loading}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
                  <Input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    disabled={loading}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                <UserPlus className="h-4 w-4" /> {loading ? 'Inscription…' : 'Créer mon compte'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Déjà inscrit ?{' '}
              <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
                Se connecter
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </AuthShell>
  )
}
