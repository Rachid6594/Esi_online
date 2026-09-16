import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Trash2, UserPlus, Plus } from 'lucide-react'
import { fetchWithAuth } from '../../auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

const ALL_TYPES = ['Cours', 'TD', 'TP', 'Devoir', 'Examen', 'Autre']

export default function AdminUploadPermissions() {
  const [perms, setPerms] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)
  const [busy, setBusy] = useState(false)

  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState('')
  const [types, setTypes] = useState(['Cours', 'TD'])
  const [note, setNote] = useState('')
  const [search, setSearch] = useState('')

  const flash = (msg, type = 'ok') => {
    setNotice({ msg, type })
    setTimeout(() => setNotice(null), 3500)
  }

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      fetchWithAuth(API_BASE, `${API_BASE}/api/eleve/upload-permissions/`).then((r) =>
        r && r.ok ? r.json() : []
      ),
      fetchWithAuth(API_BASE, `${API_BASE}/api/auth/students/`).then((r) =>
        r && r.ok ? r.json() : []
      ),
    ])
      .then(([p, s]) => {
        setPerms(Array.isArray(p) ? p : [])
        setStudents(Array.isArray(s) ? s : [])
      })
      .catch(() => {
        setPerms([])
        setStudents([])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function toggleType(t) {
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  function openCreate() {
    setUserId('')
    setTypes(['Cours', 'TD'])
    setNote('')
    setSearch('')
    setOpen(true)
  }

  async function handleGrant(e) {
    e.preventDefault()
    if (!userId) {
      flash('Choisissez un étudiant.', 'err')
      return
    }
    if (!types.length) {
      flash('Sélectionnez au moins un type.', 'err')
      return
    }
    setBusy(true)
    const r = await fetchWithAuth(API_BASE, `${API_BASE}/api/eleve/upload-permissions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: Number(userId),
        types_autorises: types,
        is_active: true,
        note,
      }),
    })
    setBusy(false)
    if (r && r.ok) {
      setOpen(false)
      flash('Étudiant promu.')
      load()
    } else {
      const data = await r?.json().catch(() => ({}))
      flash(data?.detail || 'Erreur lors de la promotion.', 'err')
    }
  }

  async function toggleActive(perm) {
    setBusy(true)
    const r = await fetchWithAuth(
      API_BASE,
      `${API_BASE}/api/eleve/upload-permissions/${perm.id}/`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !perm.is_active }),
      }
    )
    setBusy(false)
    if (r && r.ok) {
      flash(perm.is_active ? 'Promotion désactivée.' : 'Promotion réactivée.')
      load()
    }
  }

  async function revoke(perm) {
    if (!window.confirm(`Retirer la promotion de ${perm.email} ?`)) return
    setBusy(true)
    const r = await fetchWithAuth(
      API_BASE,
      `${API_BASE}/api/eleve/upload-permissions/${perm.id}/`,
      { method: 'DELETE' }
    )
    setBusy(false)
    if (r && (r.ok || r.status === 204)) {
      flash('Promotion retirée.')
      load()
    }
  }

  const filteredStudents = students.filter((s) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (s.email || '').toLowerCase().includes(q) ||
      (s.first_name || '').toLowerCase().includes(q) ||
      (s.last_name || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-muted p-2.5 text-foreground">
            <UserPlus className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Promouvoir étudiant</h1>
            <p className="text-sm text-muted-foreground">
              Donner à un étudiant le droit de déposer des fichiers (Cours, TD, TP…)
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className="h-4 w-4" /> Actualiser
          </Button>
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Promouvoir
          </Button>
        </div>
      </div>

      {notice && (
        <Alert className="mb-4" variant={notice.type === 'err' ? 'destructive' : 'default'}>
          <AlertDescription>{notice.msg}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Étudiants promu(e)s</CardTitle>
          <CardDescription>
            {loading ? 'Chargement…' : `${perms.length} étudiant(s) promu(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!loading && perms.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucun étudiant promu pour l’instant.</p>
          )}
          <div className="space-y-3">
            {perms.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {p.first_name || p.last_name
                      ? `${p.first_name} ${p.last_name}`.trim()
                      : p.email}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">{p.email}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(p.types_autorises || []).map((t) => (
                      <Badge key={t} variant="secondary">
                        {t}
                      </Badge>
                    ))}
                    <Badge variant={p.is_active ? 'default' : 'outline'}>
                      {p.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => toggleActive(p)}
                  >
                    {p.is_active ? 'Désactiver' : 'Activer'}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={busy}
                    onClick={() => revoke(p)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Promouvoir un étudiant</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGrant} className="space-y-4">
            <div className="space-y-2">
              <Label>Rechercher un étudiant</Label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Email ou nom…"
              />
            </div>
            <div className="space-y-2">
              <Label>Étudiant</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner…" />
                </SelectTrigger>
                <SelectContent>
                  {filteredStudents.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.email}
                      {s.first_name || s.last_name
                        ? ` — ${s.first_name || ''} ${s.last_name || ''}`.trim()
                        : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Types autorisés</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ALL_TYPES.map((t) => (
                  <label
                    key={t}
                    className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
                  >
                    <Checkbox
                      checked={types.includes(t)}
                      onCheckedChange={() => toggleType(t)}
                    />
                    {t}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note (optionnel)</Label>
              <Input
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex. délégué de classe"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={busy}>
                <UserPlus className="h-4 w-4" /> Promouvoir
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
