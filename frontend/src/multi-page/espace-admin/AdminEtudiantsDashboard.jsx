import { useState, useEffect, useCallback } from 'react'
import {
  GraduationCap,
  UserPlus,
  FileSpreadsheet,
  Download,
  Search,
  Users,
  RefreshCw,
  Mail,
  X,
  Eye,
} from 'lucide-react'
import { fetchWithAuth } from '../../auth'
import UserDetailModal from './UserDetailModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
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

const CSV_FORMAT = `email,prenom,nom,classe_id
etudiant1@esi.bf,Jean,Dupont,1
etudiant2@esi.bf,Marie,Martin,`

function downloadExampleCsv() {
  const blob = new Blob([CSV_FORMAT], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'etudiants_exemple.csv'
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function AdminEtudiantsDashboard() {
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const [search, setSearch] = useState('')
  const [classeId, setClasseId] = useState('')
  const [orderBy, setOrderBy] = useState('date_joined')
  const [orderDir, setOrderDir] = useState('desc')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState('form')
  const [viewing, setViewing] = useState(null)

  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', classe_id: '' })
  const [formMsg, setFormMsg] = useState({ type: '', text: '' })
  const [formLoading, setFormLoading] = useState(false)

  const [csvFile, setCsvFile] = useState(null)
  const [csvMsg, setCsvMsg] = useState({ type: '', text: '', details: null })
  const [csvLoading, setCsvLoading] = useState(false)

  const buildParams = useCallback(() => {
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (classeId) params.set('classe_id', classeId)
    const ordering = orderDir === 'desc' ? `-${orderBy}` : orderBy
    params.set('ordering', ordering)
    return params
  }, [search, classeId, orderBy, orderDir])

  const load = useCallback(() => {
    setLoading(true)
    const params = buildParams()
    fetchWithAuth(API_BASE, `${API_BASE}/api/auth/students/?${params}`)
      .then((r) => (r && r.ok ? r.json() : []))
      .then((data) => setStudents(Array.isArray(data) ? data : []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false))
  }, [buildParams])

  useEffect(() => {
    fetchWithAuth(API_BASE, `${API_BASE}/api/etablissement/classes/`)
      .then((r) => (r && r.ok ? r.json() : []))
      .then((data) => setClasses(Array.isArray(data) ? data : []))
      .catch(() => setClasses([]))
    fetchWithAuth(API_BASE, `${API_BASE}/api/auth/students/`)
      .then((r) => (r && r.ok ? r.json() : []))
      .then((data) => setTotal(Array.isArray(data) ? data.length : 0))
      .catch(() => setTotal(0))
  }, [])

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [load])

  function handleExport() {
    const url = `${API_BASE}/api/auth/students/export/?${buildParams()}`
    fetchWithAuth(API_BASE, url)
      .then((r) => (r && r.ok ? r.blob() : Promise.reject(new Error('Export �chou�'))))
      .then((blob) => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'etudiants.csv'
        a.click()
        URL.revokeObjectURL(a.href)
      })
      .catch(() => {})
  }

  async function handleCreateStudent(e) {
    e.preventDefault()
    setFormMsg({ type: '', text: '' })
    setFormLoading(true)
    try {
      const res = await fetchWithAuth(API_BASE, `${API_BASE}/api/auth/students/create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          ...(form.classe_id ? { classe_id: parseInt(form.classe_id, 10) } : {}),
        }),
      })
      if (!res) return
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setFormMsg({ type: 'error', text: data.detail || 'Erreur lors de la cr�ation.' })
        return
      }
      const isEmailFailed = (data.message || '').toLowerCase().includes('�chou�')
      setFormMsg({
        type: isEmailFailed ? 'warning' : 'success',
        text: data.message || 'Compte cr��. Les identifiants ont �t� envoy�s par email.',
      })
      setForm({ email: '', first_name: '', last_name: '', classe_id: '' })
      load()
      fetchWithAuth(API_BASE, `${API_BASE}/api/auth/students/`)
        .then((r) => (r && r.ok ? r.json() : []))
        .then((data) => setTotal(Array.isArray(data) ? data.length : 0))
        .catch(() => {})
    } catch {
      setFormMsg({ type: 'error', text: 'Erreur r�seau.' })
    } finally {
      setFormLoading(false)
    }
  }

  async function handleImportCsv(e) {
    e.preventDefault()
    if (!csvFile) {
      setCsvMsg({ type: 'error', text: 'Choisissez un fichier CSV.', details: null })
      return
    }
    setCsvMsg({ type: '', text: '', details: null })
    setCsvLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', csvFile)
      const res = await fetchWithAuth(API_BASE, `${API_BASE}/api/auth/students/import-csv/`, {
        method: 'POST',
        body: fd,
      })
      if (!res) return
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setCsvMsg({ type: 'error', text: data.detail || 'Erreur lors de l\'import.', details: null })
        return
      }
      const errCount = (data.errors || []).length
      const created = data.created ?? 0
      setCsvMsg({
        type: errCount ? (created ? 'warning' : 'error') : 'success',
        text: `${created} compte(s) cr��(s). Identifiants envoy�s par email.${errCount ? ` ${errCount} erreur(s).` : ''}`,
        details: data.errors?.length ? data.errors : null,
      })
      setCsvFile(null)
      if (e.target?.reset) e.target.reset()
      load()
    } catch {
      setCsvMsg({ type: 'error', text: 'Erreur r�seau.', details: null })
    } finally {
      setCsvLoading(false)
    }
  }

  function openModal(tab) {
    setModalTab(tab)
    setFormMsg({ type: '', text: '' })
    setCsvMsg({ type: '', text: '', details: null })
    setModalOpen(true)
  }

  const orderFields = [
    { value: 'date_joined', label: 'Date d\'inscription' },
    { value: 'email', label: 'Email' },
    { value: 'last_name', label: 'Nom' },
    { value: 'first_name', label: 'Pr�nom' },
    { value: 'id', label: 'ID' },
  ]

  const activeCount = students.filter((s) => s.is_active).length

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-muted p-2.5 text-foreground">
            <GraduationCap className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Gestion des �tudiants</h1>
            <p className="text-muted-foreground">Liste, recherche et cr�ation des comptes �tudiants.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Rafra�chir
          </Button>
          <Button type="button" variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button type="button" onClick={() => openModal('form')}>
            <UserPlus className="h-4 w-4" />
            Cr�er
          </Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Users, label: '�tudiants', value: total, cls: 'bg-muted' },
          { icon: Users, label: 'Actifs', value: students.length ? activeCount : '�', cls: 'bg-muted text-foreground' },
          { icon: Search, label: 'R�sultat(s)', value: students.length, cls: 'bg-muted' },
        ].map(({ icon: Icon, label, value, cls }) => (
          <Card key={label} className="shadow-sm">
            <CardContent className="flex items-center gap-3 pt-6">
              <div className={`rounded-lg p-3 ${cls}`}>
                <Icon className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par email, nom, pr�nom�"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-[220px] pl-9"
          />
        </div>
        <Select value={classeId || '__all__'} onValueChange={(v) => setClasseId(v === '__all__' ? '' : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Toutes les classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Toutes les classes</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.libelle || c.code}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-0 rounded-lg border border-input">
          <Select value={orderBy} onValueChange={setOrderBy}>
            <SelectTrigger className="border-0 shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {orderFields.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setOrderDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            title={orderDir === 'asc' ? 'Croissant' : 'D�croissant'}
          >
            {orderDir === 'asc' ? '?' : '?'}
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">
          {students.length} r�sultat{students.length > 1 ? 's' : ''}
        </span>
      </div>

      <Card className="shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Chargement�</div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Aucun �tudiant. Cliquez sur � Cr�er � pour en ajouter un.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background text-left text-muted-foreground">
                  <th className="p-3">Nom</th>
                  <th className="p-3">Pr�nom</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Classe</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-border hover:bg-background">
                    <td className="p-3 text-foreground">{s.last_name || '�'}</td>
                    <td className="p-3 text-foreground">{s.first_name || '�'}</td>
                    <td className="p-3">
                      <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1 text-foreground hover:underline text-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        {s.email}
                      </a>
                    </td>
                    <td className="p-3 text-foreground">
                      {s.classe_code ? `${s.classe_code}${s.classe_libelle ? ` � ${s.classe_libelle}` : ''}` : '�'}
                    </td>
                    <td className="p-3">
                      <Badge variant={s.is_active ? 'secondary' : 'outline'} className={s.is_active ? '' : ''}>
                        {s.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Button type="button" variant="outline" size="sm" onClick={() => setViewing(s)}>
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setModalOpen(false)}
              className="absolute right-3 top-3"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </Button>
            <h2 className="mb-4 text-lg font-semibold text-foreground">Cr�er un �tudiant</h2>

            <div className="mb-4 flex gap-2">
              <Button type="button" variant={modalTab === 'form' ? 'default' : 'outline'} className="flex-1" onClick={() => setModalTab('form')}>
                Formulaire
              </Button>
              <Button type="button" variant={modalTab === 'csv' ? 'default' : 'outline'} className="flex-1" onClick={() => setModalTab('csv')}>
                Import CSV
              </Button>
            </div>

            {modalTab === 'form' ? (
              <form onSubmit={handleCreateStudent} className="space-y-4">
                {formMsg.text && (
                  <Alert variant={formMsg.type === 'error' ? 'destructive' : 'default'} className={formMsg.type === 'success' ? 'border-border bg-muted text-foreground' : formMsg.type === 'warning' ? 'border-border bg-muted text-foreground' : ''}>
                    <AlertDescription>{formMsg.text}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="first_name">Pr�nom</Label>
                  <Input id="first_name" type="text" value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom</Label>
                  <Input id="last_name" type="text" value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classe">Classe (optionnel)</Label>
                  <Select value={form.classe_id || '__none__'} onValueChange={(v) => setForm((f) => ({ ...f, classe_id: v === '__none__' ? '' : v }))}>
                    <SelectTrigger id="classe" className="w-full">
                      <SelectValue placeholder="� Aucune �" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">� Aucune �</SelectItem>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.libelle || c.code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={formLoading} className="w-full">
                  {formLoading ? 'Cr�ation�' : 'Cr�er et envoyer les identifiants'}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Format attendu : une ligne d�en-t�te optionnelle <code className="rounded bg-muted px-1">email,prenom,nom,classe_id</code> (classe_id optionnel). Encodage UTF-8.
                </p>
        <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" variant="outline" onClick={downloadExampleCsv}>
                    <Download className="h-4 w-4" />
                    T�l�charger un exemple
                  </Button>
                </div>
                {csvMsg.text && (
                  <div className={`rounded-lg px-4 py-2.5 text-sm ${csvMsg.type === 'success' ? 'bg-muted text-foreground ' : csvMsg.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-foreground'}`}>
                    {csvMsg.text}
                    {csvMsg.details && csvMsg.details.length > 0 && (
                      <ul className="mt-2 list-inside list-disc text-xs">
                        {csvMsg.details.slice(0, 5).map((err, i) => (
                          <li key={i}>
                            Ligne {err.ligne} {err.email && `(${err.email})`} : {err.erreur}
                          </li>
                        ))}
                        {csvMsg.details.length > 5 && <li>� et {csvMsg.details.length - 5} autre(s) erreur(s)</li>}
                      </ul>
                    )}
                  </div>
                )}
                <form onSubmit={handleImportCsv} className="space-y-4">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-muted-foreground file:mr-2 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground"
                  />
                  <Button type="submit" disabled={csvLoading || !csvFile} className="w-full">
                    <FileSpreadsheet className="h-4 w-4" />
                    {csvLoading ? 'Import en cours�' : 'Importer et envoyer les emails'}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <UserDetailModal
        user={viewing}
        onClose={() => setViewing(null)}
        onSaved={() => {
          load()
        }}
      />
    </div>
  )
}
