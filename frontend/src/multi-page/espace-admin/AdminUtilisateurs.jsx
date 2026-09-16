import { useState, useEffect, useCallback } from 'react'
import { Users, RefreshCw, Eye, Power, Trash2, Mail, UserCheck } from 'lucide-react'
import { fetchWithAuth } from '../../auth'
import Modal from '../../components/Modal'
import UserDetailModal from './UserDetailModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

const ROLE_LABELS = {
  admin: 'Super admin',
  admin_ecole: 'Admin école',
  professeur: 'Professeur',
  bibliothecaire: 'Bibliothécaire',
  user: 'Étudiant',
}

const ROLE_OPTIONS = [
  { value: '', label: 'Tous les rôles' },
  { value: 'user', label: 'Étudiant' },
  { value: 'professeur', label: 'Professeur' },
  { value: 'bibliothecaire', label: 'Bibliothécaire' },
  { value: 'admin_ecole', label: 'Admin école' },
  { value: 'admin', label: 'Super admin' },
]

export default function AdminUtilisateurs() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [viewing, setViewing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (role) params.set('role', role)
    const qs = params.toString()
    fetchWithAuth(API_BASE, `${API_BASE}/api/auth/users/${qs ? `?${qs}` : ''}`)
      .then((r) => (r && r.ok ? r.json() : []))
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [search, role])

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [load])

  function flash(msg) {
    setNotice(msg)
    setTimeout(() => setNotice(null), 3500)
  }

  async function toggleActive(u) {
    setBusy(true)
    const r = await fetchWithAuth(API_BASE, `${API_BASE}/api/auth/users/${u.id}/toggle-active/`, {
      method: 'POST',
    })
    setBusy(false)
    if (r && r.ok) {
      load()
      flash(u.is_active ? 'Compte désactivé.' : 'Compte activé.')
    } else if (r) {
      const data = await r.json().catch(() => ({}))
      flash(data?.detail || 'Action impossible.')
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    setBusy(true)
    const r = await fetchWithAuth(API_BASE, `${API_BASE}/api/auth/users/${toDelete.id}/`, {
      method: 'DELETE',
    })
    setBusy(false)
    setToDelete(null)
    if (r && (r.ok || r.status === 204)) {
      setUsers((prev) => prev.filter((u) => u.id !== toDelete.id))
      flash('Compte supprimé.')
    } else if (r) {
      const data = await r.json().catch(() => ({}))
      flash(data?.detail || 'Suppression impossible.')
    }
  }

  return (
    <div className="p-6 sm:p-8">
      {notice && (
        <Alert className="mb-4">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-muted p-2.5 text-foreground">
            <Users className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Utilisateurs</h1>
            <p className="text-muted-foreground">IAM — comptes, recherche, filtres et actions.</p>
          </div>
        </div>
        <Button type="button" variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Rafraîchir
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          type="search"
          placeholder="Rechercher par email, prénom, nom…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={role || '__all__'} onValueChange={(v) => setRole(v === '__all__' ? '' : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tous les rôles" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((o) => (
              <SelectItem key={o.value || '__all__'} value={o.value || '__all__'}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {users.length} compte{users.length > 1 ? 's' : ''}
        </span>
      </div>

      <Card className="shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Chargement…</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Aucun utilisateur ne correspond à ces critères.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Nom</th>
                  <th className="px-4 py-3 font-medium">Prénom</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Rôle</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3 text-foreground">{u.last_name || '—'}</td>
                    <td className="px-4 py-3 text-foreground">{u.first_name || '—'}</td>
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${u.email}`}
                        className="inline-flex items-center gap-1 text-foreground hover:underline"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {u.email}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{ROLE_LABELS[u.role] || u.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.is_active ? 'secondary' : 'outline'}>
                        {u.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button type="button" variant="outline" size="sm" onClick={() => setViewing(u)}>
                          <Eye className="h-3.5 w-3.5" />
                          Voir
                        </Button>
                        {!u.is_superuser && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => toggleActive(u)}
                            disabled={busy}
                            className="text-muted-foreground hover:text-foreground"
                            title={u.is_active ? 'Désactiver' : 'Activer'}
                          >
                            {u.is_active ? <Power className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                        )}
                        {!u.is_superuser && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setToDelete(u)}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <UserDetailModal
        user={viewing}
        onClose={() => setViewing(null)}
        onSaved={() => {
          load()
        }}
      />

      <Modal open={!!toDelete} onClose={() => setToDelete(null)}>
        <h3 className="mb-2 text-lg font-semibold text-foreground">Supprimer ce compte ?</h3>
        <p className="text-sm text-muted-foreground">
          Confirmer la suppression définitive de{' '}
          <span className="font-medium text-foreground">{toDelete?.email}</span> ? Cette action est
          irréversible.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setToDelete(null)}>
            Annuler
          </Button>
          <Button type="button" variant="destructive" onClick={confirmDelete} disabled={busy}>
            <Trash2 className="h-4 w-4" />
            {busy ? 'Suppression…' : 'Supprimer'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
