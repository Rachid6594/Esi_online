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
  COURS: { label: 'Cours', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  TD: { label: 'TD / TP', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  EXAMEN: { label: 'Examen', badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  CORRIGE: { label: 'Corrigé', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  PROJET: { label: 'Projet', badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
}

// Function to get icon color according to file extension/format
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

export default function BibliothequeExplorer({ canUpload = false, currentUser = null }) {
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

  useEffect(() => {
    loadTree()
  }, [loadTree])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  // Handle Download Tracking
  const handleDownload = async (doc) => {
    try {
      await fetchWithAuth(API_BASE, `${API_BASE}/api/library/documents/${doc.id}/download/`, {
        method: 'POST',
      })
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
      const res = await fetchWithAuth(API_BASE, `${API_BASE}/api/library/documents/${docToDelete.id}/`, {
        method: 'DELETE',
      })
      if (res && (res.ok || res.status === 204)) {
        setDocuments((prev) => prev.filter((d) => d.id !== docToDelete.id))
        setDocToDelete(null)
        loadTree()
      } else {
        alert('Erreur lors de la suppression du document.')
      }
    } catch (e) {
      console.error('Error deleting document:', e)
      alert('Une erreur réseau s’est produite.')
    } finally {
      setDeleting(false)
    }
  }

  // Utility to format byte size
  const formatSize = (bytes) => {
    if (!bytes) return '—'
    if (typeof bytes === 'string') return bytes
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Utility to format dates safely
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Récemment'
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? 'Récemment' : d.toLocaleDateString('fr-FR')
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2.5 text-xl font-bold text-slate-900 dark:text-white">
            <BookOpen className="h-6 w-6 text-esi-orange" />
            Bibliothèque Numérique
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Accédez aux ressources pédagogiques, cours, TD et épreuves d’examen
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
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs shadow-sm transition placeholder:text-slate-400 focus:border-esi-orange focus:outline-none focus:ring-1 focus:ring-esi-orange dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Upload Button */}
          {canUpload && (
            <button
              onClick={() => setUploadOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-esi-orange px-4 py-2 text-xs font-semibold text-white shadow-md shadow-esi-orange/20 hover:bg-esi-orange/90 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Déposer un document</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar Navigation (Filière -> Matière Tree) */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-gray-700">
              <button
                onClick={() => setMobileTreeOpen((prev) => !prev)}
                className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider focus:outline-none"
              >
                <FolderTree className="h-4 w-4 text-esi-orange" />
                <span>Arborescence</span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 lg:hidden ${
                    mobileTreeOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {(selectedFiliere || selectedMatiere) && (
                <button
                  onClick={() => {
                    setSelectedFiliere(null)
                    setSelectedMatiere(null)
                  }}
                  className="text-[11px] font-semibold text-esi-orange hover:underline"
                >
                  Réinitialiser
                </button>
              )}
            </div>

            <div className={`mt-3 space-y-1 max-h-[500px] overflow-y-auto pr-1 ${mobileTreeOpen ? 'block' : 'hidden lg:block'}`}>
              <button
                onClick={() => {
                  setSelectedFiliere(null)
                  setSelectedMatiere(null)
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                  !selectedFiliere && !selectedMatiere
                    ? 'bg-esi-orange/10 text-esi-orange font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-gray-700'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <Folder className="h-4 w-4 text-amber-500" />
                  <span>Tous les documents</span>
                </span>
              </button>

              {treeData.map((filiere) => {
                const isSelectedF = selectedFiliere?.id === filiere.id
                return (
                  <div key={filiere.id} className="space-y-1">
                    <button
                      onClick={() => {
                        if (isSelectedF) {
                          setSelectedFiliere(null)
                          setSelectedMatiere(null)
                        } else {
                          setSelectedFiliere(filiere)
                          setSelectedMatiere(null)
                        }
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                        isSelectedF && !selectedMatiere
                          ? 'bg-esi-orange/10 text-esi-orange font-semibold'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Folder className={`h-4 w-4 ${isSelectedF ? 'text-esi-orange' : 'text-amber-500'}`} />
                        <span className="truncate">{filiere.libelle}</span>
                      </span>
                      {filiere.total_docs > 0 && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-gray-700 dark:text-slate-300">
                          {filiere.total_docs}
                        </span>
                      )}
                    </button>

                    {/* Sub-matieres */}
                    {(isSelectedF || treeData.length === 1) && filiere.matieres && (
                      <div className="ml-4 space-y-1 border-l-2 border-slate-100 pl-2 dark:border-gray-700">
                        {filiere.matieres.map((matiere) => {
                          const isSelectedM = selectedMatiere?.id === matiere.id
                          return (
                            <button
                              key={matiere.id}
                              onClick={() => {
                                setSelectedFiliere(filiere)
                                setSelectedMatiere(matiere)
                              }}
                              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition ${
                                isSelectedM
                                  ? 'bg-esi-orange text-white font-semibold shadow-sm'
                                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-gray-700'
                              }`}
                            >
                              <span className="truncate">{matiere.libelle}</span>
                              {matiere.doc_count > 0 && (
                                <span
                                  className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                                    isSelectedM
                                      ? 'bg-white/20 text-white'
                                      : 'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-slate-300'
                                  }`}
                                >
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

        {/* Right Main Grid / Documents List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Breadcrumb & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-800 dark:text-slate-200">Bibliothèque</span>
              {selectedFiliere && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  <span>{selectedFiliere.libelle}</span>
                </>
              )}
              {selectedMatiere && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-semibold text-esi-orange">{selectedMatiere.libelle}</span>
                </>
              )}
            </div>

            {/* Type Pills & View Mode Switcher */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setSelectedType('')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    !selectedType
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-gray-700 dark:text-slate-300'
                  }`}
                >
                  Tous
                </button>
                {Object.entries(TYPE_CONFIG).map(([typeKey, cfg]) => (
                  <button
                    key={typeKey}
                    onClick={() => setSelectedType(typeKey)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      selectedType === typeKey
                        ? 'bg-esi-orange text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-gray-700 dark:text-slate-300'
                    }`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>

              {/* View mode toggle */}
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-gray-700 dark:bg-gray-800">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded p-1 transition ${
                    viewMode === 'grid'
                      ? 'bg-white text-esi-orange shadow-sm dark:bg-gray-700'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Vue Grille"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded p-1 transition ${
                    viewMode === 'list'
                      ? 'bg-white text-esi-orange shadow-sm dark:bg-gray-700'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Vue Liste"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Document Content Display */}
          {loading ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-slate-400 dark:border-gray-700 dark:bg-gray-800">
              Chargement des documents…
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
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
            /* GRID VIEW */
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc) => {
                const typeCfg = TYPE_CONFIG[doc.type] || {
                  label: doc.type,
                  badge: 'bg-slate-100 text-slate-700',
                }
                const fmt = getFormatInfo(doc)
                const canDelete =
                  currentUser &&
                  (currentUser.is_superuser ||
                    currentUser.is_staff ||
                    currentUser.id === doc.auteur_id)
                const dateStr = formatDate(doc.created_at || doc.date || doc.date_upload)
                const fileSize = formatSize(doc.fichier_taille || doc.taille)

                return (
                  <div
                    key={doc.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                  >
                    {/* Zone Aperçu Visuel Document */}
                    <div
                      onClick={() => setPreviewDoc(doc)}
                      className="relative flex h-36 w-full cursor-pointer flex-col justify-between overflow-hidden border-b border-slate-100 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200/70 p-3.5 transition dark:border-gray-700/60 dark:from-gray-800/90 dark:via-gray-800 dark:to-gray-900"
                    >
                      {/* Feuille de document simulée en fond */}
                      <div className="absolute inset-x-8 -bottom-6 top-3 rounded-t-lg bg-white/80 shadow-xs border-t border-x border-slate-200/70 transition-transform duration-300 group-hover:translate-y-[-3px] dark:bg-gray-700/50 dark:border-gray-600/50">
                        <div className="p-3 space-y-2 opacity-70">
                          <div className="h-1.5 w-3/4 rounded-full bg-slate-300 dark:bg-gray-500" />
                          <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-gray-600" />
                          <div className="h-1.5 w-4/5 rounded-full bg-slate-200 dark:bg-gray-600" />
                        </div>
                      </div>

                      {/* Header de l'aperçu avec Badges */}
                      <div className="relative z-10 flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-bold shadow-2xs ${fmt.bg}`}>
                          {fmt.ext}
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold shadow-2xs ${typeCfg.badge}`}>
                          {typeCfg.label}
                        </span>
                      </div>

                      {/* Overlay hover avec bouton / indicateur de lecture */}
                      <div className="relative z-10 flex items-center justify-center">
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-white shadow-md backdrop-blur-xs opacity-0 transition-all duration-200 group-hover:opacity-100 dark:bg-white/95 dark:text-slate-900">
                          <Eye className="h-3.5 w-3.5 text-esi-orange" />
                          <span>Consulter</span>
                        </span>
                      </div>

                      {/* Code matière en bas de l'aperçu */}
                      <div className="relative z-10 flex items-center justify-end">
                        <span className="rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-600 shadow-2xs dark:bg-gray-800/90 dark:text-slate-300">
                          {doc.matiere_code || doc.matiere_libelle || 'Document'}
                        </span>
                      </div>
                    </div>

                    {/* Contenu et Métadonnées */}
                    <div className="flex flex-1 flex-col justify-between p-4">
                      <div>
                        <h4
                          onClick={() => setPreviewDoc(doc)}
                          className="mb-1.5 cursor-pointer font-semibold text-slate-900 transition hover:text-esi-orange dark:text-slate-100 line-clamp-2"
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
                        {/* Métadonnées */}
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

                        {/* Actions : Télécharger + Supprimer (Bouton aperçu retiré) */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownload(doc)}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-esi-orange px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-esi-orange/90 shadow-2xs"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Télécharger</span>
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => setDocToDelete(doc)}
                              className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
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
            /* LIST VIEW */
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 dark:bg-gray-700/50 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Format & Titre</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Matière</th>
                    <th className="px-4 py-3 font-semibold">Auteur</th>
                    <th className="px-4 py-3 font-semibold">Taille</th>
                    <th className="px-4 py-3 font-semibold text-center">Téléchargements</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                  {documents.map((doc) => {
                    const typeCfg = TYPE_CONFIG[doc.type] || {
                      label: doc.type,
                      badge: 'bg-slate-100 text-slate-700',
                    }
                    const fmt = getFormatInfo(doc)
                    const canDelete =
                      currentUser &&
                      (currentUser.is_superuser ||
                        currentUser.is_staff ||
                        currentUser.id === doc.auteur_id)
                    const dateStr = formatDate(doc.created_at || doc.date || doc.date_upload)
                    const fileSize = formatSize(doc.fichier_taille || doc.taille)

                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-gray-700/30 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[9px] font-bold ${fmt.bg}`}>
                              {fmt.ext}
                            </span>
                            <div>
                              <div
                                onClick={() => setPreviewDoc(doc)}
                                className="cursor-pointer font-semibold text-slate-900 hover:text-esi-orange dark:text-white transition"
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
                              className="rounded-lg p-1.5 text-esi-orange hover:bg-esi-orange/10 transition"
                              title="Télécharger"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            {canDelete && (
                              <button
                                onClick={() => setDocToDelete(doc)}
                                className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
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

      {/* PDF Viewer Modal */}
      {previewDoc && (
        <PdfViewerModal document={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}

      {/* Upload Document Modal */}
      {uploadOpen && (
        <DocumentUploadModal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUploaded={() => {
            setUploadOpen(false)
            loadTree()
            loadDocuments()
          }}
          onSuccess={() => {
            setUploadOpen(false)
            loadTree()
            loadDocuments()
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
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
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-gray-600 dark:text-slate-300 dark:hover:bg-gray-700"
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
