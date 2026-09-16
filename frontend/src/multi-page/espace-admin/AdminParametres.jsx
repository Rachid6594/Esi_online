import { useState, useEffect, useMemo } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { Shield, KeyRound, Plus, Trash2, Search } from 'lucide-react'
import { getAccessToken, refreshAccessToken, clearAuthAndRedirectToLogin } from '../../auth'
import AdminUtilisateurs from './AdminUtilisateurs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const API_BASE = import.meta.env.VITE_API_URL ?? ''
const ETABLISSEMENT = `${API_BASE}/api/etablissement`

const VALID_SECTIONS = ['utilisateurs', 'roles', 'permissions']

const ACTION_LABELS = {
  create: 'Créer (C)',
  read: 'Lire (R)',
  update: 'Modifier (U)',
  delete: 'Supprimer (D)',
}

const ACTION_ORDER = ['create', 'read', 'update', 'delete']

async function fetchWithAuth(url, options = {}, isRetry = false) {
  const token = getAccessToken()
  const headers = { ...options.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  const res = await fetch(url, { ...options, headers })
  if (res.status === 401 && !isRetry) {
    const refreshed = await refreshAccessToken(API_BASE)
    if (refreshed) return fetchWithAuth(url, options, true)
    clearAuthAndRedirectToLogin()
    return
  }
  return res
}

function apiGet(path) {
  return fetchWithAuth(`${ETABLISSEMENT}${path}`).then(async (r) => {
    if (!r) return []
    const text = await r.text()
    let data
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = null
    }
    if (r.ok) return Array.isArray(data) ? data : data?.results ?? data ?? []
    return Promise.reject(new Error('Erreur chargement'))
  })
}

function apiPost(path, body) {
  return fetchWithAuth(`${ETABLISSEMENT}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(async (r) => {
    if (!r) throw new Error('Non autorisé')
    const data = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(data.detail ?? data.message ?? 'Erreur')
    return data
  })
}

function apiDelete(path) {
  return fetchWithAuth(`${ETABLISSEMENT}${path}`, { method: 'DELETE' }).then((r) => {
    if (!r) throw new Error('Non autorisé')
    if (!r.ok) return r.json().then((d) => Promise.reject(new Error(d.detail ?? 'Erreur')))
    return null
  })
}

function groupRoles(droits) {
  const byDomaine = droits
    .filter((d) => d.domaine)
    .reduce((acc, d) => {
      const key = d.domaine
      if (!acc[key]) acc[key] = []
      acc[key].push(d)
      return acc
    }, {})
  Object.keys(byDomaine).forEach((key) => {
    byDomaine[key].sort((a, b) => ACTION_ORDER.indexOf(a.action) - ACTION_ORDER.indexOf(b.action))
  })
  return Object.entries(byDomaine).map(([domaine, items]) => {
    const libelleBase = (items[0]?.libelle || domaine).replace(/\s*\((C|R|U|D)\)\s*$/, '').trim()
    return { domaine, libelleBase, items, ordre: items[0]?.ordre ?? 0 }
  }).sort((a, b) => a.ordre - b.ordre || a.libelleBase.localeCompare(b.libelleBase))
}

function useDroits() {
  const [droits, setDroits] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState({ type: '', text: '' })

  function load() {
    setLoading(true)
    apiGet('/droitadministrations/')
      .then((data) => setDroits(Array.isArray(data) ? data : []))
      .catch(() => setMsg({ type: 'error', text: 'Impossible de charger les droits.' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  return { droits, loading, msg, setMsg, load }
}

function IamHeader({ icon: Icon, title, description }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <div className="rounded-xl bg-muted p-2.5 text-foreground">
        <Icon className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">IAM · Paramètres</p>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function RolesPage() {
  const { droits, loading, msg, setMsg, load } = useDroits()
  const [form, setForm] = useState({ code: '', libelle: '', ordre: 0 })
  const [submitting, setSubmitting] = useState(false)
  const roles = useMemo(() => groupRoles(droits), [droits])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.code?.trim() || !form.libelle?.trim()) {
      setMsg({ type: 'error', text: 'Code et libellé sont requis.' })
      return
    }
    setSubmitting(true)
    setMsg({ type: '', text: '' })
    apiPost('/droitadministrations/', {
      code: form.code.trim(),
      libelle: form.libelle.trim(),
      ordre: form.ordre || 0,
    })
      .then(() => {
        setMsg({ type: 'success', text: 'Rôle créé avec 4 permissions CRUD (C, R, U, D).' })
        setForm({ code: '', libelle: '', ordre: roles.length * 10 })
        load()
      })
      .catch((err) => setMsg({ type: 'error', text: err?.message ?? 'Erreur.' }))
      .finally(() => setSubmitting(false))
  }

  const handleDeleteRole = (ids) => {
    if (!window.confirm('Supprimer tout le rôle (les 4 permissions C, R, U, D) ?')) return
    Promise.all(ids.map((id) => apiDelete(`/droitadministrations/${id}/`)))
      .then(() => {
        setMsg({ type: 'success', text: 'Rôle supprimé.' })
        load()
      })
      .catch((err) => setMsg({ type: 'error', text: err?.message ?? 'Erreur.' }))
  }

  return (
    <div className="p-6 sm:p-8">
      <IamHeader
        icon={Shield}
        title="Rôles"
        description="Créez des rôles métier. Chaque rôle génère automatiquement 4 permissions CRUD."
      />

      {msg.text && (
        <Alert variant={msg.type === 'error' ? 'destructive' : 'default'} className="mb-4">
          <AlertDescription>{msg.text}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4" />
            Créer un nouveau rôle
          </CardTitle>
          <CardDescription>
            Le code sert d’identifiant technique (domaine). Le libellé apparaît dans l’attribution des droits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="role-code">Code *</Label>
              <Input
                id="role-code"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="Ex. peut_gerer_emploi"
                className="min-w-[200px]"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role-libelle">Libellé *</Label>
              <Input
                id="role-libelle"
                value={form.libelle}
                onChange={(e) => setForm((f) => ({ ...f, libelle: e.target.value }))}
                placeholder="Ex. Gérer les emplois du temps"
                className="min-w-[240px]"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role-ordre">Ordre</Label>
              <Input
                id="role-ordre"
                type="number"
                value={form.ordre}
                onChange={(e) => setForm((f) => ({ ...f, ordre: parseInt(e.target.value, 10) || 0 }))}
                className="w-24"
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Création…' : 'Créer le rôle'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rôles définis</CardTitle>
          <CardDescription>
            Consultez les permissions associées dans{' '}
            <Link to="/admin/parametres/permissions" className="underline underline-offset-2">
              Permissions
            </Link>
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : roles.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun rôle. Créez-en un ci-dessus.</p>
          ) : (
            <div className="space-y-3">
              {roles.map(({ domaine, libelleBase, items }) => (
                <div
                  key={domaine}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{libelleBase}</p>
                    <p className="font-mono text-xs text-muted-foreground">{domaine}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {items.map((d) => (
                        <Badge key={d.id} variant="secondary">
                          {ACTION_LABELS[d.action] || d.action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDeleteRole(items.map((i) => i.id))}
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function PermissionsPage() {
  const { droits, loading, msg, setMsg, load } = useDroits()
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return droits
      .filter((d) => {
        if (actionFilter && d.action !== actionFilter) return false
        if (!q) return true
        return (
          (d.code || '').toLowerCase().includes(q) ||
          (d.libelle || '').toLowerCase().includes(q) ||
          (d.domaine || '').toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        const da = (a.domaine || '').localeCompare(b.domaine || '')
        if (da !== 0) return da
        return ACTION_ORDER.indexOf(a.action) - ACTION_ORDER.indexOf(b.action)
      })
  }, [droits, search, actionFilter])

  const handleDeleteOne = (id) => {
    if (!window.confirm('Supprimer cette permission ?')) return
    apiDelete(`/droitadministrations/${id}/`)
      .then(() => {
        setMsg({ type: 'success', text: 'Permission supprimée.' })
        load()
      })
      .catch((err) => setMsg({ type: 'error', text: err?.message ?? 'Erreur.' }))
  }

  return (
    <div className="p-6 sm:p-8">
      <IamHeader
        icon={KeyRound}
        title="Permissions"
        description="Catalogue des permissions CRUD attribuables aux comptes administration."
      />

      {msg.text && (
        <Alert variant={msg.type === 'error' ? 'destructive' : 'default'} className="mb-4">
          <AlertDescription>{msg.text}</AlertDescription>
        </Alert>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher code, libellé, domaine…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={actionFilter === '' ? 'default' : 'outline'}
            onClick={() => setActionFilter('')}
          >
            Toutes
          </Button>
          {ACTION_ORDER.map((a) => (
            <Button
              key={a}
              type="button"
              size="sm"
              variant={actionFilter === a ? 'default' : 'outline'}
              onClick={() => setActionFilter(a)}
            >
              {ACTION_LABELS[a]}
            </Button>
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {filtered.length} permission{filtered.length > 1 ? 's' : ''}
        </span>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/admin/parametres/roles">Créer un rôle</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">Chargement…</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              Aucune permission. Créez un rôle pour générer des permissions CRUD.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Libellé</TableHead>
                  <TableHead>Domaine / rôle</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs">{d.code}</TableCell>
                    <TableCell>{d.libelle}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{d.domaine || '—'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{ACTION_LABELS[d.action] || d.action}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDeleteOne(d.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function UtilisateursPage() {
  return (
    <div>
      <div className="border-b border-border bg-muted/30 px-6 py-2 sm:px-8">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          IAM · Paramètres · Utilisateurs
        </p>
      </div>
      <AdminUtilisateurs />
    </div>
  )
}

export default function AdminParametres() {
  const { section } = useParams()

  if (!section) {
    return <Navigate to="/admin/parametres/utilisateurs" replace />
  }
  if (!VALID_SECTIONS.includes(section)) {
    return <Navigate to="/admin/parametres/utilisateurs" replace />
  }
  if (section === 'utilisateurs') return <UtilisateursPage />
  if (section === 'roles') return <RolesPage />
  if (section === 'permissions') return <PermissionsPage />
  return <Navigate to="/admin/parametres/utilisateurs" replace />
}
