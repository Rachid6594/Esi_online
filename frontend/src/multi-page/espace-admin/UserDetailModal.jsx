import { useState } from 'react'
import { Pencil, Save } from 'lucide-react'
import { fetchWithAuth } from '../../auth'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

const ROLE_LABELS = {
  admin: 'Super admin',
  admin_ecole: 'Admin école',
  professeur: 'Professeur',
  bibliothecaire: 'Bibliothécaire',
  user: 'Étudiant',
}

export default function UserDetailModal({ user, onClose, onSaved }) {
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [display, setDisplay] = useState(user)
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    username: user?.username || '',
    is_active: user?.is_active ?? true,
    password: '',
  })

  if (!user) return null

  const current = display || user

  function startEdit() {
    setForm({
      first_name: current.first_name || '',
      last_name: current.last_name || '',
      email: current.email || '',
      username: current.username || '',
      is_active: current.is_active ?? true,
      password: '',
    })
    setEditing(true)
    setError('')
    setMsg('')
  }

  async function handleSave(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setMsg('')
    try {
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        username: form.username.trim(),
        is_active: form.is_active,
      }
      if (form.password) payload.password = form.password
      const res = await fetchWithAuth(API_BASE, `${API_BASE}/api/auth/users/${user.id}/update/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const first = Object.values(data)[0]
        setError(Array.isArray(first) ? first.join(' ') : data.detail || 'Erreur lors de la mise à jour.')
        setBusy(false)
        return
      }
      setMsg('Modifications enregistrées.')
      onSaved && onSaved(data)
      setDisplay((prev) => ({ ...(prev || user), ...data }))
      setBusy(false)
      setEditing(false)
      setTimeout(() => setMsg(''), 2500)
    } catch {
      setError('Erreur réseau.')
      setBusy(false)
    }
  }

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? `Modifier ${current.email}` : 'Détails du compte'}
          </DialogTitle>
        </DialogHeader>

        {current.role && (
          <Badge variant="secondary">{ROLE_LABELS[current.role] || current.role}</Badge>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {msg && (
          <Alert>
            <AlertDescription>{msg}</AlertDescription>
          </Alert>
        )}

        {!editing ? (
          <div className="divide-y divide-border">
            <Row label="ID" value={current.id} />
            <Row label="Nom" value={current.last_name} />
            <Row label="Prénom" value={current.first_name} />
            <Row label="Email" value={current.email} />
            <Row label="Nom d'utilisateur" value={current.username} />
            {current.classe_libelle && <Row label="Classe" value={current.classe_libelle} />}
            {current.poste && <Row label="Poste" value={current.poste} />}
            <Row
              label="Statut"
              value={
                <Badge variant={current.is_active ? 'secondary' : 'outline'}>
                  {current.is_active ? 'Actif' : 'Inactif'}
                </Badge>
              }
            />
            {current.date_joined && (
              <Row label="Inscription" value={new Date(current.date_joined).toLocaleDateString('fr-FR')} />
            )}
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="last_name">Nom</Label>
              <Input id="last_name" value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="first_name">Prénom</Label>
              <Input id="first_name" value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Nom d&apos;utilisateur</Label>
              <Input id="username" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="Laisser vide pour ne pas changer"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_active"
                checked={form.is_active}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, is_active: !!checked }))}
              />
              <Label htmlFor="is_active" className="font-normal">Compte actif</Label>
            </div>
          </form>
        )}

        <DialogFooter>
          {!editing ? (
            <>
              <Button type="button" variant="outline" onClick={onClose}>
                Fermer
              </Button>
              <Button type="button" onClick={startEdit}>
                <Pencil className="h-4 w-4" />
                Modifier
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setEditing(false); setError(''); setMsg('') }}
              >
                Annuler
              </Button>
              <Button type="button" onClick={handleSave} disabled={busy}>
                <Save className="h-4 w-4" />
                {busy ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{value || '—'}</span>
    </div>
  )
}
