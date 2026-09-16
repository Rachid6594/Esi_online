import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export default function ChangerMotDePassePage() {
  const [searchParams] = useSearchParams()
  const uid = searchParams.get('uid') ?? ''
  const token = searchParams.get('token') ?? ''

  const [status, setStatus] = useState('loading')
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
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <p className="text-muted-foreground">Vérification du lien…</p>
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center shadow-sm">
          <CardContent className="pt-8">
            <p className="text-foreground">Ce lien est invalide ou a expiré.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Demandez un nouveau lien à l&apos;administrateur ou connectez-vous si vous avez déjà défini votre mot de passe.
            </p>
            <Button className="mt-6" asChild>
              <Link to="/login">Aller à la connexion</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center shadow-sm">
          <CardContent className="pt-8">
            <p className="font-medium text-foreground">Mot de passe mis à jour.</p>
            <p className="mt-2 text-sm text-muted-foreground">Vous pouvez maintenant vous connecter avec votre email et ce mot de passe.</p>
            <Button className="mt-6" asChild>
              <Link to="/login">Se connecter</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-muted p-2.5 text-foreground">
              <Lock className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div>
              <CardTitle className="text-xl">Changer votre mot de passe</CardTitle>
              <CardDescription>{email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <Alert variant="destructive">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="new_password">
                Nouveau mot de passe <span className="text-destructive">*</span>
              </Label>
              <Input
                id="new_password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">Minimum 8 caractères.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">
                Confirmer le mot de passe <span className="text-destructive">*</span>
              </Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">
              Retour à la connexion
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
