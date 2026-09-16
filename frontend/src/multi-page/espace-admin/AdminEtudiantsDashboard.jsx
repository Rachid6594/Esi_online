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
      .then((r) => (r && r.ok ? r.blob() : Promise.reject(new Error('Export échoué'))))
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
        setFormMsg({ type: 'error', text: data.detail || 'Erreur lors de la création.' })
        return
      }
      const isEmailFailed = (data.message || '').toLowerCase().includes('échoué')
      setFormMsg({
        type: isEmailFailed ? 'warning' : 'success',
        text: data.message || 'Compte créé. Les identifiants ont été envoyés par email.',
      })
      setForm({ email: '', first_name: '', last_name: '', classe_id: '' })
      load()
      fetchWithAuth(API_BASE, `${API_BASE}/api/auth/students/`)
        .then((r) => (r && r.ok ? r.json() : []))
        .then((data) => setTotal(Array.isArray(data) ? data.length : 0))
        .catch(() => {})
    } catch {
      setFormMsg({ type: 'error', text: 'Erreur réseau.' })
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
        text: `${created} compte(s) créé(s). Identifiants envoyés par email.${errCount ? ` ${errCount} erreur(s).` : ''}`,
        details: data.errors?.length ? data.errors : null,
      })
      setCsvFile(null)
      if (e.target?.reset) e.target.reset()
      load()
    } catch {
      setCsvMsg({ type: 'error', text: 'Erreur réseau.', details: null })
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
    { value: 'first_name', label: 'Prénom' },
    { value: 'id', label: 'ID' },
  ]

  const activeCount = students.filter((s) => s.is_active).length

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)] dark:bg-esi-orange/20 dark:text-esi-orange">
            <GraduationCap className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Gestion des étudiants</h1>
            <p className="text-slate-600 dark:text-slate-400">Liste, recherche et création des comptes étudiants.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-70 dark:border-gray-600 dark:bg-gray-800 dark:text-slate-200 dark:hover:bg-gray-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-gray-600 dark:bg-gray-800 dark:text-slate-200 dark:hover:bg-gray-700"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => openModal('form')}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-esi-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-esi-primary-hover)]"
          >
            <UserPlus className="h-4 w-4" />
            Créer
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-3 dark:bg-gray-700">
              <Users className="h-6 w-6 text-slate-600 dark:text-slate-300" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Étudiants</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-3 text-green-700 dark:bg-green-900/40 dark:text-green-300">
              <Users className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Actifs</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{students.length ? activeCount : '…'}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-3 dark:bg-gray-700">
              <Search className="h-6 w-6 text-slate-600 dark:text-slate-300" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Résultat(s)</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{students.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Rechercher par email, nom, prénom…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-w-[220px] rounded-lg border border-slate-300 px-9 py-2 text-sm text-slate-800 focus:border-[var(--color-esi-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-esi-primary)]/20 dark:border-gray-600 dark:bg-gray-800 dark:text-slate-100"
          />
        </div>
        <select
          value={classeId}
          onChange={(e) => setClasseId(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 dark:border-gray-600 dark:bg-gray-800 dark:text-slate-100"
        >
          <option value="">Toutes les classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.libelle || c.code}</option>
          ))}
        </select>
        <div className="flex items-center gap-1 rounded-lg border border-slate-300 dark:border-gray-600">
          <select
            value={orderBy}
            onChange={(e) => setOrderBy(e.target.value)}
            className="rounded-l-lg border-0 bg-transparent px-3 py-2 text-sm text-slate-800 focus:outline-none dark:text-slate-100"
          >
            {orderFields.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setOrderDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            className="rounded-r-lg border-l border-slate-300 bg-slate-50 px-2 py-2 text-slate-600 hover:bg-slate-100 dark:border-gray-600 dark:bg-gray-700 dark:text-slate-300"
            title={orderDir === 'asc' ? 'Croissant' : 'Décroissant'}
          >
            {orderDir === 'asc' ? '↑' : '↓'}
          </button>
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {students.length} résultat{students.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">Chargement…</div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            Aucun étudiant. Cliquez sur « Créer » pour en ajouter un.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600 dark:border-gray-700 dark:bg-gray-700/50 dark:text-slate-300">
                  <th className="p-3">Nom</th>
                  <th className="p-3">Prénom</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Classe</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-gray-700/40">
                    <td className="p-3 text-slate-800 dark:text-slate-200">{s.last_name || '—'}</td>
                    <td className="p-3 text-slate-800 dark:text-slate-200">{s.first_name || '—'}</td>
                    <td className="p-3">
                      <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1 text-[var(--color-esi-primary)] hover:underline dark:text-esi-primary">
                        <Mail className="h-3.5 w-3.5" />
                        {s.email}
                      </a>
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">
                      {s.classe_code ? `${s.classe_code}${s.classe_libelle ? ` – ${s.classe_libelle}` : ''}` : '—'}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${s.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-slate-400'}`}>
                        {s.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => setViewing(s)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-gray-600 dark:bg-gray-800 dark:text-slate-200 dark:hover:bg-gray-700"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute right-3 top-3 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-gray-700 dark:hover:text-slate-200"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Créer un étudiant</h2>

            <div className="mb-4 flex gap-2">
              <button
                type="button"
                onClick={() => setModalTab('form')}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${modalTab === 'form' ? 'bg-[var(--color-esi-primary)] text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-gray-600 dark:text-slate-200 dark:hover:bg-gray-700'}`}
              >
                Formulaire
              </button>
              <button
                type="button"
                onClick={() => setModalTab('csv')}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${modalTab === 'csv' ? 'bg-[var(--color-esi-primary)] text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-gray-600 dark:text-slate-200 dark:hover:bg-gray-700'}`}
              >
                Import CSV
              </button>
            </div>

            {modalTab === 'form' ? (
              <form onSubmit={handleCreateStudent} className="space-y-4">
                {formMsg.text && (
                  <div className={`rounded-lg px-4 py-2.5 text-sm ${formMsg.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900/40 dark:text-green-300' : formMsg.type === 'warning' ? 'bg-amber-50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' : formMsg.type === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-slate-100 text-slate-700 dark:bg-gray-700 dark:text-slate-200'}`}>
                    {formMsg.text}
                  </div>
                )}
                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-[var(--color-esi-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-esi-primary)]/20 dark:border-gray-600 dark:bg-gray-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label htmlFor="first_name" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Prénom
                  </label>
                  <input
                    id="first_name"
                    type="text"
                    value={form.first_name}
                    onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-[var(--color-esi-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-esi-primary)]/20 dark:border-gray-600 dark:bg-gray-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Nom
                  </label>
                  <input
                    id="last_name"
                    type="text"
                    value={form.last_name}
                    onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-[var(--color-esi-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-esi-primary)]/20 dark:border-gray-600 dark:bg-gray-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label htmlFor="classe" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Classe (optionnel)
                  </label>
                  <select
                    id="classe"
                    value={form.classe_id}
                    onChange={(e) => setForm((f) => ({ ...f, classe_id: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-[var(--color-esi-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-esi-primary)]/20 dark:border-gray-600 dark:bg-gray-900 dark:text-slate-100"
                  >
                    <option value="">— Aucune —</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.libelle || c.code}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full rounded-lg bg-[var(--color-esi-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-esi-primary-hover)] disabled:opacity-70"
                >
                  {formLoading ? 'Création…' : 'Créer et envoyer les identifiants'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Format attendu : une ligne d’en-tête optionnelle <code className="rounded bg-slate-100 px-1 dark:bg-gray-700">email,prenom,nom,classe_id</code> (classe_id optionnel). Encodage UTF-8.
                </p>
        <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={downloadExampleCsv}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-gray-600 dark:bg-gray-900 dark:text-slate-200 dark:hover:bg-gray-700"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger un exemple
                  </button>
                </div>
                {csvMsg.text && (
                  <div className={`rounded-lg px-4 py-2.5 text-sm ${csvMsg.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900/40 dark:text-green-300' : csvMsg.type === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-amber-50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                    {csvMsg.text}
                    {csvMsg.details && csvMsg.details.length > 0 && (
                      <ul className="mt-2 list-inside list-disc text-xs">
                        {csvMsg.details.slice(0, 5).map((err, i) => (
                          <li key={i}>
                            Ligne {err.ligne} {err.email && `(${err.email})`} : {err.erreur}
                          </li>
                        ))}
                        {csvMsg.details.length > 5 && <li>… et {csvMsg.details.length - 5} autre(s) erreur(s)</li>}
                      </ul>
                    )}
                  </div>
                )}
                <form onSubmit={handleImportCsv} className="space-y-4">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-slate-600 file:mr-2 file:rounded-lg file:border-0 file:bg-[var(--color-esi-primary-light)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[var(--color-esi-primary)] dark:text-slate-300"
                  />
                  <button
                    type="submit"
                    disabled={csvLoading || !csvFile}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-esi-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-esi-primary-hover)] disabled:opacity-70"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    {csvLoading ? 'Import en cours…' : 'Importer et envoyer les emails'}
                  </button>
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
