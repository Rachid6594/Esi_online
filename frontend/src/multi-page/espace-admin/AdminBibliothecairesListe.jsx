import { useState, useEffect } from 'react'
import { List, UserPlus, RefreshCw, Eye } from 'lucide-react'
import { fetchWithAuth } from '../../auth'
import UserDetailModal from './UserDetailModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

function formatValidationErrors(err) {
  if (typeof err === 'string') return err
  if (err && typeof err === 'object') {
    const parts = []
    for (const [, v] of Object.entries(err)) {
      const msg = Array.isArray(v) ? v.join(' ') : String(v)
      if (msg) parts.push(msg)
    }
    return parts.length ? parts.join(' ') : 'Erreur de validation.'
  }
  return 'Erreur de validation.'
}

export default function AdminBibliothecairesListe() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewing, setViewing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    const url = `${API_BASE}/api/auth/bibliothecaires/${params.toString() ? `?${params}` : ''}`
    fetchWithAuth(API_BASE, url)
      .then((r) => (r && r.ok ? r.json() : []))
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [search])

  function openModal() {
    setEmail('')
    setFirstName('')
    setLastName('')
    setPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
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
    setBusy(true)
    const res = await fetchWithAuth(API_BASE, `${API_BASE}/api/auth/bibliothecaires/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        password,
      }),
    })
      .then((r) => {
        if (!r) return null
        return r.ok ? r.json() : r.json().then((data) => Promise.reject(data))
      })
      .catch((err) => {
        setError(err?.detail || formatValidationErrors(err?.email || err) || 'Erreur lors de la cr�ation.')
        return null
      })
      .finally(() => setBusy(false))
    if (!res) return
    setSuccess(res?.message || 'Compte biblioth�caire cr��.')
    setEmail('')
    setFirstName('')
    setLastName('')
    setPassword('')
    setConfirmPassword('')
    setTimeout(() => {
      setModalOpen(false)
      load()
    }, 1200)
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-muted p-2.5 text-foreground">
            <List className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Gestion des biblioth�caires</h1>
            <p className="text-muted-foreground">Comptes ayant acc�s � l&apos;espace biblioth�que.</p>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Input
            type="search"
            placeholder="Rechercher�"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full flex-1 sm:flex-none sm:max-w-xs"
          />
          <Button type="button" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Rafra�chir
          </Button>
          <Button type="button" onClick={openModal}>
            <UserPlus className="h-4 w-4" />
            Cr�er
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Chargement�</div>
        ) : list.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Aucun biblioth�caire. Cliquez sur � Cr�er � pour en ajouter un.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Nom</th>
                  <th className="px-4 py-3 font-medium">Pr�nom</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((b) => (
                  <tr key={b.id} className="border-b border-border hover:bg-background">
                    <td className="px-4 py-3 text-foreground">{b.last_name || '�'}</td>
                    <td className="px-4 py-3 text-foreground">{b.first_name || '�'}</td>
                    <td className="px-4 py-3 text-foreground text-foreground">{b.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={b.is_active ? 'secondary' : 'outline'}>
                        {b.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button type="button" variant="outline" size="sm" onClick={() => setViewing(b)}>
                        <Eye className="h-3.5 w-3.5" />
                        Voir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Cr�er un biblioth�caire
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="bib_email">Email <span className="text-destructive">*</span></Label>
              <Input id="bib_email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="bibliothecaire@exemple.com" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bib_first">Pr�nom</Label>
                <Input id="bib_first" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Pr�nom" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bib_last">Nom</Label>
                <Input id="bib_last" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bib_pass">Mot de passe <span className="text-destructive">*</span></Label>
              <Input id="bib_pass" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Au moins 8 caract�res" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bib_confirm">Confirmer le mot de passe <span className="text-destructive">*</span></Label>
              <Input id="bib_confirm" type="password" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Rep�ter le mot de passe" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? 'Cr�ation�' : 'Cr�er le compte'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <UserDetailModal
        user={viewing}
        onClose={() => setViewing(null)}
        onSaved={() => load()}
      />
    </div>
  )
}
