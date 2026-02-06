import { useState, useEffect } from 'react'
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
    if (!r) throw new Error('Non autorisé')
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
  return parts.length ? parts.join(' — ') : null
}

const VALID_SECTIONS = ['annees', 'niveaux', 'filieres', 'classes', 'matieres', 'adminEcoles']
const SECTION_TITLES = {
  annees: 'Années académiques',
  niveaux: 'Niveaux',
  filieres: 'Filières',
  classes: 'Classes',
  matieres: 'Matières',
  adminEcoles: 'Administration École',
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
        <div className="rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)]">
          {Icon ? <Icon className="h-7 w-7" strokeWidth={1.5} /> : <Building2 className="h-7 w-7" strokeWidth={1.5} />}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{SECTION_TITLES[section]}</h1>
          <p className="text-slate-600">
            Gestion de l&apos;établissement — {SECTION_TITLES[section].toLowerCase()}.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        {loading[section] && <p className="text-sm text-slate-500">Chargement…</p>}
        {msg.section === section && (
          <p className={`mb-2 text-sm ${msg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{msg.text}</p>
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
      </div>
    </div>
  )
}

function AnneesSection({ list, onReload, onMsg, apiPost }) {
  const [form, setForm] = useState({ libelle: '', date_debut: '', date_fin: '', is_active: false })
  const [submitting, setSubmitting] = useState(false)
  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    apiPost('/anneeacademiques/', form)
      .then(() => {
        onMsg('success', 'Année académique créée.')
        setForm({ libelle: '', date_debut: '', date_fin: '', is_active: false })
        onReload()
      })
      .catch((err) => onMsg('error', err.message || 'Erreur'))
      .finally(() => setSubmitting(false))
  }
  return (
    <>
      <table className="mb-4 w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-600">
            <th className="py-2">Libellé</th>
            <th className="py-2">Début</th>
            <th className="py-2">Fin</th>
            <th className="py-2">Active</th>
          </tr>
        </thead>
        <tbody>
          {list.map((a) => (
            <tr key={a.id} className="border-b border-slate-100">
              <td className="py-2">{a.libelle}</td>
              <td className="py-2">{a.date_debut}</td>
              <td className="py-2">{a.date_fin}</td>
              <td className="py-2">{a.is_active ? 'Oui' : 'Non'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <input
          placeholder="Libellé (ex. 2024-2025)"
          value={form.libelle}
          onChange={(e) => setForm((f) => ({ ...f, libelle: e.target.value }))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          required
        />
        <input
          type="date"
          value={form.date_debut}
          onChange={(e) => setForm((f) => ({ ...f, date_debut: e.target.value }))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          required
        />
        <input
          type="date"
          value={form.date_fin}
          onChange={(e) => setForm((f) => ({ ...f, date_fin: e.target.value }))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          required
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
          />
          Active
        </label>
        <button type="submit" disabled={submitting} className="rounded-lg bg-[var(--color-esi-primary)] px-4 py-2 text-sm text-white hover:bg-[var(--color-esi-primary-hover)] disabled:opacity-70">
          Ajouter
        </button>
      </form>
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
        onMsg('success', 'Niveau créé.')
        setForm({ code: '', libelle: '', ordre: 0 })
        onReload()
      })
      .catch((err) => onMsg('error', err.message || 'Erreur'))
      .finally(() => setSubmitting(false))
  }
  return (
    <>
      <table className="mb-4 w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-600">
            <th className="py-2">Code</th>
            <th className="py-2">Libellé</th>
            <th className="py-2">Ordre</th>
          </tr>
        </thead>
        <tbody>
          {list.map((n) => (
            <tr key={n.id} className="border-b border-slate-100">
              <td className="py-2">{n.code}</td>
              <td className="py-2">{n.libelle}</td>
              <td className="py-2">{n.ordre}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <input
          placeholder="Code (ex. L1)"
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.slice(0, 2) }))}
          maxLength={2}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm w-20"
          required
          title="2 caractères max (ex. L1, M2)"
        />
        <input
          placeholder="Libellé (ex. Licence 1)"
          value={form.libelle}
          onChange={(e) => setForm((f) => ({ ...f, libelle: e.target.value }))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          required
        />
        <input
          type="number"
          placeholder="Ordre"
          value={form.ordre}
          onChange={(e) => setForm((f) => ({ ...f, ordre: parseInt(e.target.value, 10) || 0 }))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm w-20"
        />
        <button type="submit" disabled={submitting} className="rounded-lg bg-[var(--color-esi-primary)] px-4 py-2 text-sm text-white hover:bg-[var(--color-esi-primary-hover)] disabled:opacity-70">
          Ajouter
        </button>
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
        onMsg('success', 'Filière créée.')
        setForm({ code: '', libelle: '', description: '' })
        onReload()
      })
      .catch((err) => onMsg('error', err.message || 'Erreur'))
      .finally(() => setSubmitting(false))
  }
  return (
    <>
      <table className="mb-4 w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-600">
            <th className="py-2">Code</th>
            <th className="py-2">Libellé</th>
          </tr>
        </thead>
        <tbody>
          {list.map((f) => (
            <tr key={f.id} className="border-b border-slate-100">
              <td className="py-2">{f.code}</td>
              <td className="py-2">{f.libelle}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <input
          placeholder="Code (ex. GL)"
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm w-24"
          required
        />
        <input
          placeholder="Libellé (ex. Génie Logiciel)"
          value={form.libelle}
          onChange={(e) => setForm((f) => ({ ...f, libelle: e.target.value }))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm flex-1 min-w-[200px]"
          required
        />
        <button type="submit" disabled={submitting} className="rounded-lg bg-[var(--color-esi-primary)] px-4 py-2 text-sm text-white hover:bg-[var(--color-esi-primary-hover)] disabled:opacity-70">
          Ajouter
        </button>
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
      onMsg('error', 'Choisissez niveau, filière et année académique.')
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
        onMsg('success', 'Classe créée.')
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
          <tr className="border-b text-left text-slate-600">
            <th className="py-2">Code</th>
            <th className="py-2">Libellé</th>
            <th className="py-2">Effectif max</th>
          </tr>
        </thead>
        <tbody>
          {list.map((c) => (
            <tr key={c.id} className="border-b border-slate-100">
              <td className="py-2">{c.code}</td>
              <td className="py-2">{c.libelle}</td>
              <td className="py-2">{c.effectif_max}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mb-2 text-xs text-slate-500">
        Créez d&apos;abord des <button type="button" onClick={onOpenAnnees} className="text-[var(--color-esi-primary)] underline">années académiques</button>, des <button type="button" onClick={onOpenNiveaux} className="text-[var(--color-esi-primary)] underline">niveaux</button> et des <button type="button" onClick={onOpenFilieres} className="text-[var(--color-esi-primary)] underline">filières</button>.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-wrap gap-3">
          <input
            placeholder="Code (ex. L1-GL-24)"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm w-32"
            required
          />
          <input
            placeholder="Libellé"
            value={form.libelle}
            onChange={(e) => setForm((f) => ({ ...f, libelle: e.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm flex-1 min-w-[180px]"
            required
          />
          <select
            value={form.niveau}
            onChange={(e) => setForm((f) => ({ ...f, niveau: e.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            required
          >
            <option value="">Niveau</option>
            {niveaux.map((n) => (
              <option key={n.id} value={n.id}>{n.code} – {n.libelle}</option>
            ))}
          </select>
          <select
            value={form.filiere}
            onChange={(e) => setForm((f) => ({ ...f, filiere: e.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            required
          >
            <option value="">Filière</option>
            {filieres.map((f) => (
              <option key={f.id} value={f.id}>{f.code} – {f.libelle}</option>
            ))}
          </select>
          <select
            value={form.annee_academique}
            onChange={(e) => setForm((f) => ({ ...f, annee_academique: e.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            required
          >
            <option value="">Année académique</option>
            {annees.map((a) => (
              <option key={a.id} value={a.id}>{a.libelle}</option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={form.effectif_max}
            onChange={(e) => setForm((f) => ({ ...f, effectif_max: parseInt(e.target.value, 10) || 50 }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm w-24"
          />
        </div>
        <button type="submit" disabled={submitting} className="rounded-lg bg-[var(--color-esi-primary)] px-4 py-2 text-sm text-white hover:bg-[var(--color-esi-primary-hover)] disabled:opacity-70">
          Ajouter la classe
        </button>
      </form>
    </>
  )
}

function MatieresSection({ list, niveaux, filieres, onReload, onMsg, apiPost }) {
  const [form, setForm] = useState({ code: '', libelle: '', niveau: '', filiere: '', semestre: 1, coefficient: 1, credit: 3 })
  const [submitting, setSubmitting] = useState(false)
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
        onMsg('success', 'Matière créée.')
        setForm({ code: '', libelle: '', niveau: '', filiere: '', semestre: 1, coefficient: 1, credit: 3 })
        onReload()
      })
      .catch((err) => onMsg('error', err.message || 'Erreur'))
      .finally(() => setSubmitting(false))
  }
  return (
    <>
      <table className="mb-4 w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-600">
            <th className="py-2">Code</th>
            <th className="py-2">Libellé</th>
            <th className="py-2">Sem.</th>
          </tr>
        </thead>
        <tbody>
          {list.map((m) => (
            <tr key={m.id} className="border-b border-slate-100">
              <td className="py-2">{m.code}</td>
              <td className="py-2">{m.libelle}</td>
              <td className="py-2">{m.semestre}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <input placeholder="Code" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm w-24" required />
        <input placeholder="Libellé" value={form.libelle} onChange={(e) => setForm((f) => ({ ...f, libelle: e.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
        <select value={form.niveau} onChange={(e) => setForm((f) => ({ ...f, niveau: e.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">Niveau</option>
          {niveaux.map((n) => <option key={n.id} value={n.id}>{n.code}</option>)}
        </select>
        <select value={form.filiere} onChange={(e) => setForm((f) => ({ ...f, filiere: e.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">Filière</option>
          {filieres.map((f) => <option key={f.id} value={f.id}>{f.code}</option>)}
        </select>
        <input type="number" min="1" value={form.semestre} onChange={(e) => setForm((f) => ({ ...f, semestre: parseInt(e.target.value, 10) || 1 }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm w-20" />
        <button type="submit" disabled={submitting} className="rounded-lg bg-[var(--color-esi-primary)] px-4 py-2 text-sm text-white hover:bg-[var(--color-esi-primary-hover)] disabled:opacity-70">Ajouter</button>
      </form>
    </>
  )
}

function AdminEcolesSection({ list }) {
  return (
    <p className="text-sm text-slate-500">
      Liste des comptes Administration École ({list.length}). La création se fait via la gestion des utilisateurs (lien avec un compte utilisateur).
    </p>
  )
}
