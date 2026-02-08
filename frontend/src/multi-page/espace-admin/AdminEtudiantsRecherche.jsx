import { useState, useEffect } from 'react'
import { GraduationCap, Search, Filter, ArrowUpDown, Download, Save, Trash2 } from 'lucide-react'
import { fetchWithAuth } from '../../auth'

const API_BASE = import.meta.env.VITE_API_URL ?? ''
const STORAGE_VIEWS = 'esi_etudiants_vues'

function loadSavedViews() {
  try {
    const raw = localStorage.getItem(STORAGE_VIEWS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveView(name, config) {
  const views = loadSavedViews()
  views.push({ id: Date.now(), name, config: { ...config }, createdAt: new Date().toISOString() })
  localStorage.setItem(STORAGE_VIEWS, JSON.stringify(views))
}

function deleteView(id) {
  const views = loadSavedViews().filter((v) => v.id !== id)
  localStorage.setItem(STORAGE_VIEWS, JSON.stringify(views))
}

export default function AdminEtudiantsRecherche() {
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [savedViews, setSavedViews] = useState(loadSavedViews())

  const [search, setSearch] = useState('')
  const [classeId, setClasseId] = useState('')
  const [isActive, setIsActive] = useState('')
  const [orderBy, setOrderBy] = useState('date_joined')
  const [orderDir, setOrderDir] = useState('desc')
  const [viewName, setViewName] = useState('')
  const [msg, setMsg] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchWithAuth(API_BASE, `${API_BASE}/api/etablissement/classes/`)
      .then((r) => (r && r.ok ? r.json() : []))
      .then((data) => setClasses(Array.isArray(data) ? data : []))
      .catch(() => setClasses([]))
  }, [])

  function buildParams() {
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (classeId) params.set('classe_id', classeId)
    if (isActive !== '') params.set('is_active', isActive)
    const ordering = orderDir === 'desc' ? `-${orderBy}` : orderBy
    params.set('ordering', ordering)
    return params
  }

  function runSearch() {
    setLoading(true)
    const params = buildParams()
    fetchWithAuth(API_BASE, `${API_BASE}/api/auth/students/?${params}`)
      .then((r) => (r && r.ok ? r.json() : []))
      .then((data) => setStudents(Array.isArray(data) ? data : []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false))
  }

  function handleExport() {
    const params = buildParams()
    const url = `${API_BASE}/api/auth/students/export/?${params}`
    fetchWithAuth(API_BASE, url)
      .then((r) => (r && r.ok ? r.blob() : Promise.reject(new Error('Export échoué'))))
      .then((blob) => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'etudiants.csv'
        a.click()
        URL.revokeObjectURL(a.href)
        setMsg({ type: 'success', text: 'Fichier CSV téléchargé.' })
        setTimeout(() => setMsg({ type: '', text: '' }), 3000)
      })
      .catch(() => setMsg({ type: 'error', text: 'Erreur lors de l\'export.' }))
  }

  function handleSaveView() {
    if (!viewName.trim()) {
      setMsg({ type: 'error', text: 'Donnez un nom à la vue.' })
      return
    }
    saveView(viewName.trim(), { search, classeId, isActive, orderBy, orderDir })
    setSavedViews(loadSavedViews())
    setViewName('')
    setMsg({ type: 'success', text: 'Vue enregistrée.' })
    setTimeout(() => setMsg({ type: '', text: '' }), 2000)
  }

  function applyView(config) {
    setSearch(config.search ?? '')
    setClasseId(config.classeId ?? '')
    setIsActive(config.isActive ?? '')
    setOrderBy(config.orderBy ?? 'date_joined')
    setOrderDir(config.orderDir ?? 'desc')
  }

  const orderFields = [
    { value: 'date_joined', label: 'Date d\'inscription' },
    { value: 'email', label: 'Email' },
    { value: 'last_name', label: 'Nom' },
    { value: 'first_name', label: 'Prénom' },
    { value: 'id', label: 'ID' },
  ]

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)]">
          <Search className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Recherche avancée</h1>
          <p className="text-slate-600">
            Filtres, règles de tri, vues sauvegardées et export Excel (CSV).
          </p>
        </div>
      </div>

      {/* Bloc filtres / query builder */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter className="h-4 w-4" />
          Critères et tri
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[180px]">
            <label className="mb-1 block text-xs font-medium text-slate-500">Recherche texte</label>
            <input
              type="text"
              placeholder="Email, nom, prénom…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Classe</label>
            <select
              value={classeId}
              onChange={(e) => setClasseId(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Toutes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.libelle || c.code}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Actif</label>
            <select
              value={isActive}
              onChange={(e) => setIsActive(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Tous</option>
              <option value="1">Oui</option>
              <option value="0">Non</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Tri</label>
            <div className="flex items-center gap-1 rounded-lg border border-slate-300">
              <select
                value={orderBy}
                onChange={(e) => setOrderBy(e.target.value)}
                className="rounded-l-lg border-0 px-3 py-2 text-sm"
              >
                {orderFields.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setOrderDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                className="rounded-r-lg border-l border-slate-300 bg-slate-50 px-2 py-2 text-slate-600 hover:bg-slate-100"
                title={orderDir === 'asc' ? 'Croissant' : 'Décroissant'}
              >
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={runSearch}
            disabled={loading}
            className="rounded-lg bg-[var(--color-esi-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-esi-primary-hover)] disabled:opacity-70"
          >
            {loading ? 'Recherche…' : 'Appliquer'}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Nom de la vue"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm w-40"
            />
            <button
              type="button"
              onClick={handleSaveView}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Save className="h-4 w-4" /> Enregistrer la vue
            </button>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
          >
            <Download className="h-4 w-4" /> Export Excel (CSV)
          </button>
        </div>

        {savedViews.length > 0 && (
          <div className="mt-4 border-t border-slate-200 pt-4">
            <p className="mb-2 text-xs font-medium text-slate-500">Vues enregistrées</p>
            <div className="flex flex-wrap gap-2">
              {savedViews.map((v) => (
                <span
                  key={v.id}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs"
                >
                  <button type="button" onClick={() => applyView(v.config)} className="font-medium text-slate-700 hover:underline">
                    {v.name}
                  </button>
                  <button type="button" onClick={() => { deleteView(v.id); setSavedViews(loadSavedViews()); }} className="text-slate-400 hover:text-red-600">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {msg.text && (
          <p className={`mt-3 text-sm ${msg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{msg.text}</p>
        )}
      </div>

      {/* Résultats */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-600">
          {students.length} résultat(s)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-slate-600">
                <th className="p-3">ID</th>
                <th className="p-3">Email</th>
                <th className="p-3">Prénom</th>
                <th className="p-3">Nom</th>
                <th className="p-3">Classe</th>
                <th className="p-3">Actif</th>
                <th className="p-3">Inscription</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3">{s.id}</td>
                  <td className="p-3">{s.email}</td>
                  <td className="p-3">{s.first_name}</td>
                  <td className="p-3">{s.last_name}</td>
                  <td className="p-3">{s.classe_code ?? '—'}</td>
                  <td className="p-3">{s.is_active ? 'Oui' : 'Non'}</td>
                  <td className="p-3">{s.date_joined ? new Date(s.date_joined).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
