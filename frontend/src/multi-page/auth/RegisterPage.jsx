import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, Mail, Lock, User, GraduationCap, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { ThemeToggle } from '../../components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

function AuthShell({ children }) {
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
      {children}
      <footer className="border-t border-border/80 bg-background/80 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ESI Online — Portail officiel de l'École Supérieure d'Informatique
      </footer>
    </div>
  )
}

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
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
      setError('Erreur réseau. Impossible de contacter le serveur.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthShell>
        <main className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-10">
          <Card className="w-full max-w-md text-center shadow-xl border-border/80 animate-slide-up">
            <CardContent className="pt-8 pb-8 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Compte créé avec succès !</h2>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Votre inscription a bien été enregistrée. Vous pouvez dès à présent vous connecter à votre espace ESI.
              </p>
              <Button
                className="mt-4 w-full bg-gradient-to-r from-[#8B3A3D] to-[#C45C26] hover:from-[#722F31] hover:to-[#A34D1F] text-white font-bold"
                asChild
              >
                <Link to="/login">Accéder à la connexion</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <main className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-10">
        <Card className="shadow-xl border-border/80 overflow-hidden animate-slide-up">
          <div className="h-2 bg-gradient-to-r from-[#C45C26] via-[#A8483B] to-[#8B3A3D]" />
          <CardHeader className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-[#C45C26]/15 to-[#8B3A3D]/15 p-3 text-[#C45C26]">
                <UserPlus className="h-6 w-6" strokeWidth={2} />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Inscription</CardTitle>
                <CardDescription className="text-xs">Créez votre compte étudiant ou enseignant ESI</CardDescription>
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
                <Label htmlFor="username" className="text-xs font-semibold">Nom d&apos;utilisateur</Label>
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
                    className="pl-10 h-10 text-sm focus-visible:ring-[#C45C26]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">Adresse e-mail universitaire</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@esi.dz"
                    required
                    autoComplete="email"
                    disabled={loading}
                    className="pl-10 h-10 text-sm focus-visible:ring-[#C45C26]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 caractères"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    disabled={loading}
                    className="pl-10 pr-10 h-10 text-sm focus-visible:ring-[#C45C26]"
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

              <div className="space-y-1.5">
                <Label htmlFor="confirm" className="text-xs font-semibold">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
                  <Input
                    id="confirm"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    disabled={loading}
                    className="pl-10 pr-10 h-10 text-sm focus-visible:ring-[#C45C26]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded focus:outline-none"
                    title={showConfirm ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    aria-label={showConfirm ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showConfirm ? (
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
                className="w-full h-11 bg-gradient-to-r from-[#C45C26] to-[#8B3A3D] hover:from-[#A34D1F] hover:to-[#722F31] text-white font-bold shadow-md shadow-[#C45C26]/25 transition-all mt-2"
                size="lg"
              >
                <UserPlus className="h-4 w-4" /> {loading ? 'Création en cours…' : 'Créer mon compte'}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t text-center text-xs text-muted-foreground">
              Déjà inscrit ?{' '}
              <Link to="/login" className="font-bold text-[#8B3A3D] dark:text-rose-400 hover:underline">
                Se connecter
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </AuthShell>
  )
}

