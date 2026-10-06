import { useState, useEffect, useCallback } from 'react'
import {
  FolderTree,
  Folder,
  FileText,
  Search,
  Download,
  Eye,
  Trash2,
  Filter,
  Plus,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Calendar,
  User,
  HardDrive,
  Sparkles,
  LayoutGrid,
  List,
} from 'lucide-react'
import { fetchWithAuth } from '../auth'
import PdfViewerModal from './PdfViewerModal'
import DocumentUploadModal from './DocumentUploadModal'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

const TYPE_CONFIG = {
  COURS:   { label: 'Cours',   badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  TD:      { label: 'TD / TP', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  EXAMEN:  { label: 'Examen',  badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  CORRIGE: { label: 'Corrigé', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  PROJET:  { label: 'Projet',  badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
}

const DELAYS = ['delay-50', 'delay-100', 'delay-150', 'delay-200', 'delay-250', 'delay-300']

function getFormatInfo(doc) {
  const url = (doc.fichier || doc.fichier_url || '').toLowerCase()
  if (url.endsWith('.pdf') || doc.type === 'EXAMEN') {
    return { ext: 'PDF', bg: 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/50' }
  }
  if (url.endsWith('.pptx') || url.endsWith('.ppt')) {
    return { ext: 'PPTX', bg: 'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-900/50' }
  }
  if (url.endsWith('.docx') || url.endsWith('.doc')) {
    return { ext: 'DOCX', bg: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/50' }
  }
  if (url.endsWith('.zip') || url.endsWith('.rar')) {
    return { ext: 'ZIP', bg: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-900/50' }
  }
  return { ext: 'FILE', bg: 'bg-gray-500/10 text-gray-600 border-gray-200 dark:border-gray-700' }
}

/* ── Skeleton card ─────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-gray-700 dark:bg-gray-800">
      <div className="h-36 animate-shimmer dark:bg-gray-700" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-3/4 rounded-full animate-shimmer" />
        <div className="h-3 w-full rounded-full animate-shimmer" />
        <div className="h-3 w-2/3 rounded-full animate-shimmer" />
        <div className="mt-4 h-8 rounded-xl animate-shimmer" />
      </div>
    </div>
  )
}

export default function BibliothequeExplorer({ canUpload = false, currentUser = null, isAdminView = false }) {
  const [treeData, setTreeData] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [mobileTreeOpen, setMobileTreeOpen] = useState(false)

  // Selection & Filters
  const [selectedFiliere, setSelectedFiliere] = useState(null)
  const [selectedMatiere, setSelectedMatiere] = useState(null)
  const [selectedType, setSelectedType] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals state
  const [previewDoc, setPreviewDoc] = useState(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [docToDelete, setDocToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Load Tree
  const loadTree = useCallback(async () => {
    try {
      const res = await fetchWithAuth(API_BASE, `${API_BASE}/api/library/tree/`)
      if (res && res.ok) {
        const data = await res.json()
        setTreeData(Array.isArray(data) ? data : [])
      }
    } catch (e) {
      console.error('Error loading tree data:', e)
    }
  }, [])

  // Load Documents
  const loadDocuments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedFiliere) params.append('filiere', selectedFiliere.id)
      if (selectedMatiere) params.append('matiere', selectedMatiere.id)
      if (selectedType) params.append('type', selectedType)
      if (searchQuery) params.append('q', searchQuery)

      const url = `${API_BASE}/api/library/documents/?${params.toString()}`
      const res = await fetchWithAuth(API_BASE, url)
      if (res && res.ok) {
        const data = await res.json()
        setDocuments(Array.isArray(data) ? data : data.results ?? [])
      } else {
        setDocuments([])
      }
    } catch (e) {
      console.error('Error loading documents:', e)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }, [selectedFiliere, selectedMatiere, selectedType, searchQuery])

  useEffect(() => { loadTree() }, [loadTree])
  useEffect(() => { loadDocuments() }, [loadDocuments])

  // Handle Download Tracking
  const handleDownload = async (doc) => {
    try {
      await fetchWithAuth(API_BASE, `${API_BASE}/api/library/documents/${doc.id}/download/`, { method: 'POST' })
    } catch (e) {
      console.error('Failed to log download:', e)
    }

    const fileUrl = doc.fichier_url || doc.fichier
    if (fileUrl) {
      const link = document.createElement('a')
      link.href = fileUrl.startsWith('http') ? fileUrl : `${API_BASE}${fileUrl}`
      link.download = doc.titre || 'document'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Handle Document Delete
  const handleDeleteConfirm = async () => {
    if (!docToDelete) return
    setDeleting(true)
    try {
      const res = await fetchWithAuth(API_BASE, `${API_BASE}/api/library/documents/${docToDelete.id}/`, { method: 'DELETE' })
      if (res && (res.ok || res.status === 204)) {
        setDocuments((prev) => prev.filter((d) => d.id !== docToDelete.id))
        setDocToDelete(null)
        loadTree()
      } else {
        alert('Erreur lors de la suppression du document.')
      }
    } catch (e) {
      console.error('Error deleting document:', e)
      alert("Une erreur réseau s'est produite.")
    } finally {
      setDeleting(false)
    }
  }

  const formatSize = (bytes) => {
    if (!bytes) return '—'
    if (typeof bytes === 'string') return bytes
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Récemment'
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? 'Récemment' : d.toLocaleDateString('fr-FR')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Top Header Bar ─────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2.5 text-xl font-bold text-slate-900 dark:text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-esi-orange-light)]">
              <BookOpen className="h-4.5 w-4.5 text-[var(--color-esi-orange)]" />
            </span>
            Bibliothèque Numérique
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Accédez aux ressources pédagogiques, cours, TD et épreuves d'examen
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Global Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un document…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs shadow-sm transition-all placeholder:text-slate-400
                focus:border-[var(--color-esi-orange)] focus:outline-none focus:ring-2 focus:ring-[var(--color-esi-orange)]/20
                dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Upload Button */}
          {canUpload && (
            <button
              onClick={() => setUploadOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-esi-orange)] px-4 py-2 text-xs font-semibold text-white
                shadow-md shadow-[var(--color-esi-orange)]/25 transition-all duration-200
                hover:bg-[var(--color-esi-orange-hover)] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[var(--color-esi-orange)]/30
                active:translate-y-0 btn-esi-glow"
            >
              <Plus className="h-4 w-4" />
              <span>Déposer un document</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Main Content Layout ─────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">

        {/* ── Sidebar: Arborescence ────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
            {/* Sidebar header with ESI primary gradient accent */}
            <div className="border-b border-slate-100 dark:border-gray-700"
                 style={{ background: 'linear-gradient(135deg, var(--color-esi-primary-light) 0%, #fff 100%)' }}>
              <div className="flex items-center justify-between px-4 py-3">
                <button
                  onClick={() => setMobileTreeOpen((prev) => !prev)}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-esi-primary)] focus:outline-none dark:text-slate-200"
                >
                  <FolderTree className="h-4 w-4" />
                  <span>Arborescence</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 lg:hidden ${
                      mobileTreeOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {(selectedFiliere || selectedMatiere) && (
                  <button
                    onClick={() => { setSelectedFiliere(null); setSelectedMatiere(null) }}
                    className="text-[11px] font-semibold text-[var(--color-esi-orange)] hover:underline transition"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>

            <div className={`p-2 space-y-0.5 max-h-[500px] overflow-y-auto ${mobileTreeOpen ? 'block' : 'hidden lg:block'}`}>
              {/* All docs button */}
              <button
                onClick={() => { setSelectedFiliere(null); setSelectedMatiere(null) }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-150 ${
                  !selectedFiliere && !selectedMatiere
                    ? 'bg-[var(--color-esi-primary-light)] text-[var(--color-esi-primary)] font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-gray-700'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <Folder className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Tous les documents</span>
                </span>
              </button>

              {treeData.map((filiere) => {
                const isSelectedF = selectedFiliere?.id === filiere.id
                return (
                  <div key={filiere.id} className="space-y-0.5">
                    <button
                      onClick={() => {
                        if (isSelectedF) { setSelectedFiliere(null); setSelectedMatiere(null) }
                        else { setSelectedFiliere(filiere); setSelectedMatiere(null) }
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-150 ${
                        isSelectedF && !selectedMatiere
                          ? 'bg-[var(--color-esi-primary-light)] text-[var(--color-esi-primary)] font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Folder className={`h-4 w-4 shrink-0 ${isSelectedF ? 'text-[var(--color-esi-primary)]' : 'text-amber-500'}`} />
                        <span className="truncate">{filiere.libelle}</span>
                      </span>
                      {filiere.total_docs > 0 && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 transition-colors ${
                          isSelectedF
                            ? 'bg-[var(--color-esi-primary)] text-white'
                            : 'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-slate-300'
                        }`}>
                          {filiere.total_docs}
                        </span>
                      )}
                    </button>

                    {/* Sub-matieres */}
                    {(isSelectedF || treeData.length === 1) && filiere.matieres && (
                      <div className="ml-4 space-y-0.5 border-l-2 border-[var(--color-esi-primary-light)] pl-2 dark:border-gray-700 animate-slide-up">
                        {filiere.matieres.map((matiere) => {
                          const isSelectedM = selectedMatiere?.id === matiere.id
                          return (
                            <button
                              key={matiere.id}
                              onClick={() => { setSelectedFiliere(filiere); setSelectedMatiere(matiere) }}
                              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-all duration-150 ${
                                isSelectedM
                                  ? 'bg-[var(--color-esi-orange)] text-white font-semibold shadow-sm shadow-[var(--color-esi-orange)]/30'
                                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-gray-700'
                              }`}
                            >
                              <span className="truncate">{matiere.libelle}</span>
                              {matiere.doc_count > 0 && (
                                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold shrink-0 ${
                                  isSelectedM
                                    ? 'bg-white/25 text-white'
                                    : 'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-slate-300'
                                }`}>
                                  {matiere.doc_count}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Right: Documents Grid / List ────────────────── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Breadcrumb & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Bibliothèque</span>
              {selectedFiliere && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-600">{selectedFiliere.libelle}</span>
                </>
              )}
              {selectedMatiere && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-semibold text-[var(--color-esi-orange)]">{selectedMatiere.libelle}</span>
                </>
              )}
            </div>

            {/* Type Pills & View Mode Switcher */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setSelectedType('')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                    !selectedType
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-gray-700 dark:text-slate-300'
                  }`}
                >
                  Tous
                </button>
                {Object.entries(TYPE_CONFIG).map(([typeKey, cfg]) => (
                  <button
                    key={typeKey}
                    onClick={() => setSelectedType(typeKey)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                      selectedType === typeKey
                        ? 'bg-[var(--color-esi-orange)] text-white shadow-sm shadow-[var(--color-esi-orange)]/25'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-gray-700 dark:text-slate-300'
                    }`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>

              {/* View mode toggle */}
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-gray-700 dark:bg-gray-800 shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded p-1 transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-[var(--color-esi-orange)] shadow-sm dark:bg-gray-700'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Vue Grille"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded p-1 transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-[var(--color-esi-orange)] shadow-sm dark:bg-gray-700'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Vue Liste"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Document Content ─────────────────────────── */}
          {loading ? (
            /* Skeleton Grid */
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800 animate-fade-in">
              <div className="mb-3 rounded-full bg-slate-100 p-4 text-slate-400 dark:bg-gray-700">
                <FileText className="h-8 w-8" />
              </div>
              <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                Aucun document trouvé
              </h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Essayez de modifier vos filtres ou effectuez une autre recherche.
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            /* ── GRID VIEW ──────────────────────────────── */
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc, idx) => {
                const typeCfg = TYPE_CONFIG[doc.type] || { label: doc.type, badge: 'bg-slate-100 text-slate-700' }
                const fmt = getFormatInfo(doc)
                const canDelete =
                  isAdminView ||
                  (currentUser && (currentUser.is_superuser || currentUser.is_staff || currentUser.id === doc.auteur_id))
                const dateStr = formatDate(doc.created_at || doc.date || doc.date_upload)
                const fileSize = formatSize(doc.fichier_taille || doc.taille)
                const delay = DELAYS[idx % DELAYS.length]

                return (
                  <div
                    key={doc.id}
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white
                      shadow-xs transition-all duration-250 hover:-translate-y-1 hover:shadow-xl hover:border-slate-300
                      dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600
                      card-shine animate-slide-up ${delay}`}
                  >
                    {/* ── Aperçu visuel ───────────────────── */}
                    <div
                      onClick={() => setPreviewDoc(doc)}
                      className="relative flex h-36 w-full cursor-pointer flex-col justify-between overflow-hidden border-b border-slate-100
                        bg-gradient-to-br from-slate-50 via-white to-slate-100/80 p-3.5 transition
                        dark:border-gray-700/60 dark:from-gray-800/90 dark:via-gray-800 dark:to-gray-900"
                    >
                      {/* Subtle ESI primary top accent line */}
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[var(--color-esi-primary)] via-[var(--color-esi-orange)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Simulated document page */}
                      <div className="absolute inset-x-8 -bottom-6 top-3 rounded-t-lg bg-white/90 shadow-sm border-t border-x border-slate-200/80 transition-transform duration-300 group-hover:-translate-y-1.5 dark:bg-gray-700/60 dark:border-gray-600/50">
                        <div className="p-3 space-y-2 opacity-60">
                          <div className="h-1.5 w-3/4 rounded-full bg-slate-300 dark:bg-gray-500" />
                          <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-gray-600" />
                          <div className="h-1.5 w-4/5 rounded-full bg-slate-200 dark:bg-gray-600" />
                          <div className="h-1.5 w-2/3 rounded-full bg-slate-100 dark:bg-gray-700" />
                        </div>
                      </div>

                      {/* Badges row */}
                      <div className="relative z-10 flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-bold shadow-xs ${fmt.bg}`}>
                          {fmt.ext}
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold shadow-xs ${typeCfg.badge}`}>
                          {typeCfg.label}
                        </span>
                      </div>

                      {/* Hover overlay: "Consulter" */}
                      <div className="relative z-10 flex items-center justify-center">
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-white
                          shadow-md backdrop-blur-sm opacity-0 transition-all duration-200 group-hover:opacity-100 scale-95 group-hover:scale-100
                          dark:bg-white/95 dark:text-slate-900">
                          <Eye className="h-3.5 w-3.5 text-[var(--color-esi-orange)]" />
                          <span>Consulter</span>
                        </span>
                      </div>

                      {/* Matière code bottom-right */}
                      <div className="relative z-10 flex items-center justify-end">
                        <span className="rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-600 shadow-xs dark:bg-gray-800/90 dark:text-slate-300">
                          {doc.matiere_code || doc.matiere_libelle || 'Document'}
                        </span>
                      </div>
                    </div>

                    {/* ── Card body ───────────────────────── */}
                    <div className="flex flex-1 flex-col justify-between p-4">
                      <div>
                        <h4
                          onClick={() => setPreviewDoc(doc)}
                          className="mb-1.5 cursor-pointer font-semibold text-slate-900 transition-colors hover:text-[var(--color-esi-primary)] dark:text-slate-100 line-clamp-2"
                          title={doc.titre}
                        >
                          {doc.titre}
                        </h4>

                        {doc.description && (
                          <p className="mb-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {doc.description}
                          </p>
                        )}
                      </div>

                      <div>
                        {/* Metadata */}
                        <div className="mb-3.5 space-y-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-500 dark:border-gray-700/70 dark:text-slate-400">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 truncate max-w-[160px]" title={doc.auteur_nom}>
                              <User className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="truncate">{doc.auteur_nom || 'Enseignant ESI'}</span>
                            </span>
                            <span className="flex items-center gap-1 shrink-0" title="Téléchargements">
                              <Download className="h-3 w-3 text-slate-400" />
                              <span>{doc.nb_telechargements || doc.downloads_count || 0}</span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 shrink-0">
                              <Calendar className="h-3 w-3 text-slate-400" />
                              <span>{dateStr}</span>
                            </span>
                            <span className="flex items-center gap-1 font-mono text-[10px] shrink-0">
                              <HardDrive className="h-3 w-3 text-slate-400" />
                              <span>{fileSize}</span>
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownload(doc)}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-esi-orange)] px-3.5 py-2 text-xs font-semibold text-white
                              transition-all duration-200 hover:bg-[var(--color-esi-orange-hover)] hover:shadow-md hover:shadow-[var(--color-esi-orange)]/30
                              active:scale-95 btn-esi-glow"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Télécharger</span>
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => setDocToDelete(doc)}
                              className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 transition-all hover:bg-red-100 hover:scale-105 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
                              title="Supprimer ce document"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* ── LIST VIEW ──────────────────────────────── */
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 animate-slide-up">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 dark:bg-gray-700/50 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Format & Titre</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Matière</th>
                    <th className="px-4 py-3 font-semibold">Auteur</th>
                    <th className="px-4 py-3 font-semibold">Taille</th>
                    <th className="px-4 py-3 font-semibold text-center">Téléch.</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                  {documents.map((doc) => {
                    const typeCfg = TYPE_CONFIG[doc.type] || { label: doc.type, badge: 'bg-slate-100 text-slate-700' }
                    const fmt = getFormatInfo(doc)
                    const canDelete =
                      isAdminView ||
                      (currentUser && (currentUser.is_superuser || currentUser.is_staff || currentUser.id === doc.auteur_id))
                    const fileSize = formatSize(doc.fichier_taille || doc.taille)

                    return (
                      <tr key={doc.id} className="hover:bg-[var(--color-esi-primary-light)]/30 dark:hover:bg-gray-700/30 transition-colors duration-100 group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[9px] font-bold shrink-0 ${fmt.bg}`}>
                              {fmt.ext}
                            </span>
                            <div>
                              <div
                                onClick={() => setPreviewDoc(doc)}
                                className="cursor-pointer font-semibold text-slate-900 hover:text-[var(--color-esi-primary)] dark:text-white transition-colors"
                                title={doc.titre}
                              >
                                {doc.titre}
                              </div>
                              {doc.description && (
                                <div className="text-[11px] text-slate-400 truncate max-w-xs">{doc.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeCfg.badge}`}>
                            {typeCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
                          {doc.matiere_code || doc.matiere_libelle || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                          {doc.auteur_nom || 'Enseignant ESI'}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">
                          {fileSize}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300 font-semibold">
                          {doc.nb_telechargements || doc.downloads_count || 0}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleDownload(doc)}
                              className="rounded-lg p-1.5 text-[var(--color-esi-orange)] hover:bg-[var(--color-esi-orange-light)] transition-all hover:scale-110"
                              title="Télécharger"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            {canDelete && (
                              <button
                                onClick={() => setDocToDelete(doc)}
                                className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all hover:scale-110"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── PDF Viewer Modal ────────────────────────────────── */}
      {previewDoc && (
        <PdfViewerModal document={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}

      {/* ── Upload Document Modal ───────────────────────────── */}
      {uploadOpen && (
        <DocumentUploadModal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUploaded={() => { setUploadOpen(false); loadTree(); loadDocuments() }}
          onSuccess={() => { setUploadOpen(false); loadTree(); loadDocuments() }}
        />
      )}

      {/* ── Delete Confirmation Modal ──────────────────────── */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800 animate-slide-up">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Confirmer la suppression
            </h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
              Voulez-vous vraiment supprimer le document « <span className="font-semibold text-slate-800 dark:text-slate-100">{docToDelete.titre}</span> » ? Cette action est irréversible.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                disabled={deleting}
                onClick={() => setDocToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-gray-600 dark:text-slate-300 dark:hover:bg-gray-700 transition"
              >
                Annuler
              </button>
              <button
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition shadow-sm disabled:opacity-50"
              >
                {deleting ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
