import { useState, useEffect } from 'react'
import DataTable from '../../components/DataTable'
import CsvImportZone from '../../components/CsvImportZone'
import Modal from '../../components/Modal'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import {
  Building2,
  Calendar,
  Layers,
  BookOpen,
  GraduationCap,
  BookMarked,
  Users,
} from 'lucide-react'
import { getAccessToken, refreshAccessToken, clearAuthAndRedirectToLogin } from '../../auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

const API_BASE = import.meta.env.VITE_API_URL ?? ''
const ETABLISSEMENT = `${API_BASE}/api/etablissement`

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
    if (r.ok) {
      return Array.isArray(data) ? data : data?.results ?? data ?? []
    }
    const msg = data?.detail ?? data?.message ?? `Erreur ${r.status}`
    return Promise.reject(new Error(Array.isArray(msg) ? msg[0] : msg))
  })
}

function apiPost(path, body) {
  return fetchWithAuth(`${ETABLISSEMENT}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(async (r) => {
    if (!r) throw new Error('Non autorisÃ©')
    const data = await r.json().catch(() => ({}))
    if (!r.ok) {
      const msg = data.detail ?? data.message ?? formatValidationErrors(data) ?? 'Erreur'
      return Promise.reject(new Error(typeof msg === 'string' ? msg : msg[0]))
    }
    return data
  })
}

function formatValidationErrors(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const parts = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`)
  return parts.length ? parts.join(' â ') : null
}

const VALID_SECTIONS = ['annees', 'niveaux', 'filieres', 'classes', 'matieres', 'adminEcoles']
const SECTION_TITLES = {
  annees: 'AnnÃ©es acadÃ©miques',
  niveaux: 'Niveaux',
  filieres: 'FiliÃ¨res',
  classes: 'Classes',
  matieres: 'MatiÃ¨res',
  adminEcoles: 'Administration Ãcole',
}
const SECTION_ICONS = { annees: Calendar, niveaux: Layers, filieres: BookOpen, classes: GraduationCap, matieres: BookMarked, adminEcoles: Users }

export default function AdminEtablissement() {
  const { section } = useParams()
  const navigate = useNavigate()
  if (!section || !VALID_SECTIONS.includes(section)) {
    return <Navigate to="/admin/etablissement/annees" replace />
  }

  const [annees, setAnnees] = useState([])
  const [niveaux, setNiveaux] = useState([])
  const [filieres, setFilieres] = useState([])
  const [classes, setClasses] = useState([])
  const [matieres, setMatieres] = useState([])
  const [adminEcoles, setAdminEcoles] = useState([])
  const [loading, setLoading] = useState({})
  const [msg, setMsg] = useState({ section: '', type: '', text: '' })

  function load(sectionKey) {
    setLoading((l) => ({ ...l, [sectionKey]: true }))
    const paths = {
      annees: '/anneeacademiques/',
      niveaux: '/niveaus/',
      filieres: '/filieres/',
      classes: '/classes/',
      matieres: '/matieres/',
      adminEcoles: '/administrationecoles/',
    }
    apiGet(paths[sectionKey])
      .then((data) => {
        const setters = {
          annees: setAnnees,
          niveaux: setNiveaux,
          filieres: setFilieres,
          classes: setClasses,
          matieres: setMatieres,
          adminEcoles: setAdminEcoles,
        }
        const setter = setters[sectionKey]
        if (setter) setter(Array.isArray(data) ? data : [])
      })
      .catch((err) => setMsg({ section: sectionKey, type: 'error', text: err?.message || 'Erreur chargement.' }))
      .finally(() => setLoading((l) => ({ ...l, [sectionKey]: false })))
  }

  useEffect(() => {
    load(section)
    if (section === 'classes') {
      load('annees')
      load('niveaux')
      load('filieres')
    } else if (section === 'matieres') {
      load('niveaux')
      load('filieres')
    }
  }, [section])

  const showMsg = (sectionKey, type, text) => {
    setMsg({ section: sectionKey, type, text })
    if (type === 'success') setTimeout(() => setMsg({ section: '', type: '', text: '' }), 3000)
  }

  const openSectionLink = (s) => () => navigate(`/admin/etablissement/${s}`)
  const Icon = SECTION_ICONS[section]

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-muted p-2.5 text-foreground">
          {Icon ? <Icon className="h-7 w-7" strokeWidth={1.5} /> : <Building2 className="h-7 w-7" strokeWidth={1.5} />}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{SECTION_TITLES[section]}</h1>
          <p className="text-muted-foreground">
            Gestion de l&apos;Ã©tablissement â {SECTION_TITLES[section].toLowerCase()}.
          </p>
        </div>
      </div>

      <Card className="p-4 text-card-foreground">
        {loading[section] && <p className="text-sm text-muted-foreground">Chargementâ¦</p>}
        {msg.section === section && (
          <Alert variant={msg.type === 'error' ? 'destructive' : 'default'} className="mb-2">
            <AlertDescription>{msg.text}</AlertDescription>
          </Alert>
        )}

        {section === 'annees' && (
          <AnneesSection
            list={annees}
            onReload={() => load('annees')}
            onMsg={(type, text) => showMsg('annees', type, text)}
            apiPost={apiPost}
          />
        )}
        {section === 'niveaux' && (
          <NiveauxSection
            list={niveaux}
            onReload={() => load('niveaux')}
            onMsg={(type, text) => showMsg('niveaux', type, text)}
            apiPost={apiPost}
          />
        )}
        {section === 'filieres' && (
          <FilieresSection
            list={filieres}
            onReload={() => load('filieres')}
            onMsg={(type, text) => showMsg('filieres', type, text)}
            apiPost={apiPost}
          />
        )}
        {section === 'classes' && (
          <ClassesSection
            list={classes}
            annees={annees}
            niveaux={niveaux}
            filieres={filieres}
            onReload={() => load('classes')}
            onOpenAnnees={openSectionLink('annees')}
            onOpenNiveaux={openSectionLink('niveaux')}
            onOpenFilieres={openSectionLink('filieres')}
            onMsg={(type, text) => showMsg('classes', type, text)}
            apiPost={apiPost}
          />
        )}
        {section === 'matieres' && (
          <MatieresSection
            list={matieres}
            niveaux={niveaux}
            filieres={filieres}
            onReload={() => load('matieres')}
            onMsg={(type, text) => showMsg('matieres', type, text)}
            apiPost={apiPost}
          />
        )}
        {section === 'adminEcoles' && <AdminEcolesSection list={adminEcoles} />}
      </Card>
    </div>
  )
}

function AnneesSection({ list, onReload, onMsg, apiPost }) {
    // Import CSV
    async function handleImport(file) {
      const formData = new FormData()
      formData.append('file', file)
      try {
        const res = await fetch('/api/etablissement/users/import-csv', {
          method: 'POST',
          body: formData,
        })
        if (!res.ok) throw new Error('Erreur import')
        onMsg('success', 'Import CSV rÃ©ussi')
        onReload()
      } catch (e) {
        onMsg('error', e.message)
      }
    }
  const [form, setForm] = useState({ libelle: '', date_debut: '', date_fin: '', is_active: false })
  const [submitting, setSubmitting] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    apiPost('/anneeacademiques/', form)
      .then(() => {
        onMsg('success', 'AnnÃ©e acadÃ©mique crÃ©Ã©e.')
        setForm({ libelle: '', date_debut: '', date_fin: '', is_active: false })
        onReload()
      })
      .catch((err) => onMsg('error', err.message || 'Erreur'))
      .finally(() => setSubmitting(false))
  }
  return (
    <>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CsvImportZone onImport={handleImport} />
        <Button type="button" onClick={() => setModalOpen(true)}>Nouvelle annÃ©e</Button>
      </div>
      {/* DataTable avec tri/pagination */}
      <DataTable
        columns={[
          { key: 'libelle', label: 'LibellÃ©' },
          { key: 'date_debut', label: 'DÃ©but' },
          { key: 'date_fin', label: 'Fin' },
          { key: 'is_active', label: 'Active', render: (v) => (v ? 'Oui' : 'Non') },
        ]}
        data={list.map((a) => ({ ...a, is_active: a.is_active ? 'Oui' : 'Non' }))}
        pageSize={5}
      />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h2 className="text-lg font-semibold mb-4">Nouvelle annÃ©e acadÃ©mique</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            placeholder="LibellÃ© (ex. 2024-2025)"
            value={form.libelle}
            onChange={(e) => setForm((f) => ({ ...f, libelle: e.target.value }))}
            required
          />
          <Input
            type="date"
            value={form.date_debut}
            onChange={(e) => setForm((f) => ({ ...f, date_debut: e.target.value }))}
            required
          />
          <Input
            type="date"
            value={form.date_fin}
            onChange={(e) => setForm((f) => ({ ...f, date_fin: e.target.value }))}
            required
          />
          <div className="flex items-center gap-2">
            <Checkbox
              id="annee_active"
              checked={form.is_active}
              onCheckedChange={(checked) => setForm((f) => ({ ...f, is_active: !!checked }))}
            />
            <Label htmlFor="annee_active" className="font-normal">Active</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={submitting}>Ajouter</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

function NiveauxSection({ list, onReload, onMsg, apiPost }) {
  const [form, setForm] = useState({ code: '', libelle: '', ordre: 0 })
  const [submitting, setSubmitting] = useState(false)
  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    const payload = { code: form.code.trim(), libelle: form.libelle.trim(), ordre: Number(form.ordre) || 0 }
    apiPost('/niveaus/', payload)
      .then(() => {
        onMsg('success', 'Niveau crÃ©Ã©.')
        setForm({ code: '', libelle: '', ordre: 0 })
        onReload()
      })
      .catch((err) => onMsg('error', err.message || 'Erreur'))
      .finally(() => setSubmitting(false))
  }
  return (
    <>
      <DataTable
        columns={[
          { key: 'code', label: 'Code' },
          { key: 'libelle', label: 'LibellÃ©' },
          { key: 'ordre', label: 'Ordre' },
        ]}
        data={list}
        pageSize={5}
      />
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <input
          placeholder="Code (ex. L1)"
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.slice(0, 2) }))}
          maxLength={2}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground w-20"
          required
          title="2 caractÃ¨res max (ex. L1, M2)"
        />
        <input
          placeholder="LibellÃ© (ex. Licence 1)"
          value={form.libelle}
          onChange={(e) => setForm((f) => ({ ...f, libelle: e.target.value }))}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
          required
        />
        <input
          type="number"
          placeholder="Ordre"
          value={form.ordre}
          onChange={(e) => setForm((f) => ({ ...f, ordre: parseInt(e.target.value, 10) || 0 }))}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground w-20"
        />
        <Button type="submit" disabled={submitting}>Ajouter</Button>
      </form>
    </>
  )
}

function FilieresSection({ list, onReload, onMsg, apiPost }) {
  const [form, setForm] = useState({ code: '', libelle: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    apiPost('/filieres/', form)
      .then(() => {
        onMsg('success', 'FiliÃ¨re crÃ©Ã©e.')
        setForm({ code: '', libelle: '', description: '' })
        onReload()
      })
      .catch((err) => onMsg('error', err.message || 'Erreur'))
      .finally(() => setSubmitting(false))
  }
  return (
    <>
      <DataTable
        columns={[
          { key: 'code', label: 'Code' },
          { key: 'libelle', label: 'LibellÃ©' },
        ]}
        data={list}
        pageSize={5}
      />
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <input
          placeholder="Code (ex. GL)"
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground w-24"
          required
        />
        <input
          placeholder="LibellÃ© (ex. GÃ©nie Logiciel)"
          value={form.libelle}
          onChange={(e) => setForm((f) => ({ ...f, libelle: e.target.value }))}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground flex-1 min-w-[200px]"
          required
        />
        <Button type="submit" disabled={submitting}>Ajouter</Button>
      </form>
    </>
  )
}

function ClassesSection({
  list,
  annees,
  niveaux,
  filieres,
  onReload,
  onOpenAnnees,
  onOpenNiveaux,
  onOpenFilieres,
  onMsg,
  apiPost,
}) {
  const [form, setForm] = useState({
    code: '',
    libelle: '',
    niveau: '',
    filiere: '',
    annee_academique: '',
    effectif_max: 50,
  })
  const [submitting, setSubmitting] = useState(false)
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.niveau || !form.filiere || !form.annee_academique) {
      onMsg('error', 'Choisissez niveau, filiÃ¨re et annÃ©e acadÃ©mique.')
      return
    }
    setSubmitting(true)
    apiPost('/classes/', {
      code: form.code,
      libelle: form.libelle,
      niveau: parseInt(form.niveau, 10),
      filiere: parseInt(form.filiere, 10),
      annee_academique: parseInt(form.annee_academique, 10),
      effectif_max: form.effectif_max || 50,
    })
      .then(() => {
        onMsg('success', 'Classe crÃ©Ã©e.')
        setForm({ code: '', libelle: '', niveau: '', filiere: '', annee_academique: '', effectif_max: 50 })
        onReload()
      })
      .catch((err) => onMsg('error', err.message || 'Erreur'))
      .finally(() => setSubmitting(false))
  }
  return (
    <>
      <table className="mb-4 w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-2">Code</th>
            <th className="py-2">LibellÃ©</th>
            <th className="py-2">Effectif max</th>
          </tr>
        </thead>
        <tbody>
          {list.map((c) => (
            <tr key={c.id} className="border-b border-border">
              <td className="py-2">{c.libelle || c.code}</td>
              <td className="py-2">{c.libelle}</td>
              <td className="py-2">{c.effectif_max}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mb-2 text-xs text-muted-foreground">
        CrÃ©ez d&apos;abord des <Button type="button" variant="link" className="h-auto p-0" onClick={onOpenAnnees}>annÃ©es acadÃ©miques</Button>, des <Button type="button" variant="link" className="h-auto p-0" onClick={onOpenNiveaux}>niveaux</Button> et des <Button type="button" variant="link" className="h-auto p-0" onClick={onOpenFilieres}>filiÃ¨res</Button>.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-wrap gap-3">
          <input
            placeholder="Code (ex. L1-GL-24)"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground w-32"
            required
          />
          <input
            placeholder="LibellÃ©"
            value={form.libelle}
            onChange={(e) => setForm((f) => ({ ...f, libelle: e.target.value }))}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground flex-1 min-w-[180px]"
            required
          />
          <select
            value={form.niveau}
            onChange={(e) => setForm((f) => ({ ...f, niveau: e.target.value }))}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
            required
          >
            <option value="">Niveau</option>
            {niveaux.map((n) => (
              <option key={n.id} value={n.id}>{n.libelle || n.code}</option>
            ))}
          </select>
          <select
            value={form.filiere}
            onChange={(e) => setForm((f) => ({ ...f, filiere: e.target.value }))}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
            required
          >
            <option value="">FiliÃ¨re</option>
            {filieres.map((f) => (
              <option key={f.id} value={f.id}>{f.libelle || f.code}</option>
            ))}
          </select>
          <select
            value={form.annee_academique}
            onChange={(e) => setForm((f) => ({ ...f, annee_academique: e.target.value }))}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
            required
          >
            <option value="">AnnÃ©e acadÃ©mique</option>
            {annees.map((a) => (
              <option key={a.id} value={a.id}>{a.libelle}</option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={form.effectif_max}
            onChange={(e) => setForm((f) => ({ ...f, effectif_max: parseInt(e.target.value, 10) || 50 }))}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground w-24"
          />
        </div>
        <Button type="submit" disabled={submitting}>Ajouter la classe</Button>
      </form>
    </>
  )
}

function MatieresSection({ list, niveaux, filieres, onReload, onMsg, apiPost }) {
  const [form, setForm] = useState({ code: '', libelle: '', niveau: '', filiere: '', semestre: 1, coefficient: 1, credit: 3 })
  const [submitting, setSubmitting] = useState(false)
  const [filterSemestre, setFilterSemestre] = useState(0) // 0 = tous

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    apiPost('/matieres/', {
      code: form.code,
      libelle: form.libelle,
      niveau: form.niveau ? parseInt(form.niveau, 10) : null,
      filiere: form.filiere ? parseInt(form.filiere, 10) : null,
      semestre: form.semestre || 1,
      coefficient: form.coefficient || 1,
      credit: form.credit || 3,
    })
      .then(() => {
        onMsg('success', 'MatiÃ¨re crÃ©Ã©e.')
        setForm({ code: '', libelle: '', niveau: '', filiere: '', semestre: 1, coefficient: 1, credit: 3 })
        onReload()
      })
      .catch((err) => onMsg('error', err.message || 'Erreur'))
      .finally(() => setSubmitting(false))
  }

  const filteredList = filterSemestre > 0 ? list.filter((m) => m.semestre === filterSemestre) : list
  const bySemestre = filteredList.reduce((acc, m) => {
    const s = m.semestre || 1
    if (!acc[s]) acc[s] = []
    acc[s].push(m)
    return acc
  }, {})
  const semestresOrdre = [...new Set(filteredList.map((m) => m.semestre || 1))].sort((a, b) => a - b)

  return (
    <>
      <p className="mb-3 text-sm text-muted-foreground">
        Chaque matiÃ¨re est rattachÃ©e Ã  un <strong>semestre</strong>. Le programme d&apos;un semestre est l&apos;ensemble des matiÃ¨res de ce semestre (âventuellement par niveau/filiÃ¨re).
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-foreground">Voir le programme du semestre :</label>
        <select
          value={filterSemestre}
          onChange={(e) => setFilterSemestre(Number(e.target.value))}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
        >
          <option value={0}>Tous les semestres</option>
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <option key={s} value={s}>Semestre {s}</option>
          ))}
        </select>
      </div>

      {semestresOrdre.length === 0 ? (
        <p className="mb-4 text-sm text-muted-foreground">Aucune matiÃ¨re. Ajoutez des matiÃ¨res ci-dessous en choisissant le semestre.</p>
      ) : (
        <div className="mb-6 space-y-6">
          {semestresOrdre.map((sem) => (
            <div key={sem}>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Programme du semestre {sem}</h3>
              <table className="w-full text-sm text-foreground">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2">LibellÃ©</th>
                    <th className="py-2">Code</th>
                    <th className="py-2">Niveau</th>
                    <th className="py-2">FiliÃ¨re</th>
                    <th className="py-2">Coef.</th>
                    <th className="py-2">CrÃ©dits</th>
                  </tr>
                </thead>
                <tbody>
                  {(bySemestre[sem] || []).map((m) => (
                    <tr key={m.id} className="border-b border-border">
                      <td className="py-2">{m.libelle}</td>
                      <td className="py-2">{m.code}</td>
                      <td className="py-2">{m.niveau ? ((niveaux.find((n) => n.id === m.niveau)?.libelle || niveaux.find((n) => n.id === m.niveau)?.code) ?? m.niveau) : 'â'}</td>
                      <td className="py-2">{m.filiere ? ((filieres.find((f) => f.id === m.filiere)?.libelle || filieres.find((f) => f.id === m.filiere)?.code) ?? m.filiere) : 'â'}</td>
                      <td className="py-2">{m.coefficient ?? 'â'}</td>
                      <td className="py-2">{m.credit ?? 'â'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      <h3 className="mb-2 text-sm font-semibold text-foreground">
        {`Ajouter une matiÃ¨re au programme (choisir le semestre)`}
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">LibellÃ©</label>
          <input placeholder="Ex. MathÃ©matiques" value={form.libelle} onChange={(e) => setForm((f) => ({ ...f, libelle: e.target.value }))} className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground min-w-[180px]" required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Code</label>
          <input placeholder="Ex. MATH01" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground w-24" required />
        </div>
        <select value={form.niveau} onChange={(e) => setForm((f) => ({ ...f, niveau: e.target.value }))} className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground">
          <option value="">Niveau</option>
          {niveaux.map((n) => <option key={n.id} value={n.id}>{n.libelle || n.code}</option>)}
        </select>
        <select value={form.filiere} onChange={(e) => setForm((f) => ({ ...f, filiere: e.target.value }))} className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground">
          <option value="">FiliÃ¨re</option>
          {filieres.map((f) => <option key={f.id} value={f.id}>{f.libelle || f.code}</option>)}
        </select>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Semestre</label>
          <input type="number" min="1" max="10" value={form.semestre} onChange={(e) => setForm((f) => ({ ...f, semestre: parseInt(e.target.value, 10) || 1 }))} className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground w-20" title="Programme du semestre" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Coef.</label>
          <input type="number" min="0" step="0.5" value={form.coefficient} onChange={(e) => setForm((f) => ({ ...f, coefficient: parseFloat(e.target.value) || 1 }))} className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground w-16" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">CrÃ©dits</label>
          <input type="number" min="0" value={form.credit} onChange={(e) => setForm((f) => ({ ...f, credit: parseInt(e.target.value, 10) || 3 }))} className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground w-16" />
        </div>
        <Button type="submit" disabled={submitting}>Ajouter la matiÃ¨re</Button>
      </form>
    </>
  )
}

function AdminEcolesSection({ list }) {
  return (
    <p className="text-sm text-muted-foreground">
      Liste des comptes Administration Ãcole ({list.length}). La crÃ©ation se fait via la gestion des utilisateurs (lien avec un compte utilisateur).
    </p>
  )
}
