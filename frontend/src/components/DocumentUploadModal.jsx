import { useState, useEffect, useRef } from 'react'
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { fetchWithAuth } from '../auth'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

const ALLOWED_TYPES = ['.pdf', '.docx', '.pptx', '.zip']
const MAX_SIZE_MB = 50

export default function DocumentUploadModal({ open = true, onClose, onUploaded, onSuccess }) {
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [titre, setTitre] = useState('')
  const [typeDoc, setTypeDoc] = useState('COURS')
  const [matiereId, setMatiereId] = useState('')
  const [description, setDescription] = useState('')
  const [annee, setAnnee] = useState(new Date().getFullYear())
  
  const [matieres, setMatieres] = useState([])
  const [loadingMatieres, setLoadingMatieres] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const fileInputRef = useRef(null)

  useEffect(() => {
    setLoadingMatieres(true)
    fetchWithAuth(API_BASE, `${API_BASE}/api/etablissement/matieres/`)
      .then((r) => (r && r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMatieres(data)
          setMatiereId((prev) => prev || data[0].id)
        } else {
          setMatieres([
            { id: 'mat-1', code: 'INF301', libelle: 'Algorithmique et structures de données' },
            { id: 'mat-2', code: 'INF302', libelle: 'Bases de données avancées' },
            { id: 'mat-3', code: 'INF304', libelle: 'Génie logiciel & Méthodes agiles' },
            { id: 'mat-4', code: 'INF303', libelle: 'Réseaux informatiques' },
          ])
          setMatiereId((prev) => prev || 'mat-1')
        }
      })
      .catch(() => {
        setMatieres([
          { id: 'mat-1', code: 'INF301', libelle: 'Algorithmique et structures de données' },
          { id: 'mat-2', code: 'INF302', libelle: 'Bases de données avancées' },
          { id: 'mat-3', code: 'INF304', libelle: 'Génie logiciel & Méthodes agiles' },
        ])
        setMatiereId((prev) => prev || 'mat-1')
      })
      .finally(() => setLoadingMatieres(false))
  }, [])

  if (!open) return null

  const resetForm = () => {
    setFile(null)
    setTitre('')
    setTypeDoc('COURS')
    setMatiereId('')
    setDescription('')
    setError(null)
    setSuccess(false)
    setProgress(0)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false
    const ext = '.' + selectedFile.name.split('.').pop().toLowerCase()
    if (!ALLOWED_TYPES.includes(ext)) {
      setError(`Type de fichier non autorisé (${ext}). Types acceptés : PDF, DOCX, PPTX, ZIP.`)
      return false
    }
    const sizeMb = selectedFile.size / (1024 * 1024)
    if (sizeMb > MAX_SIZE_MB) {
      setError(`Le fichier dépasse la taille maximale autorisée (${sizeMb.toFixed(1)}MB > 50MB).`)
      return false
    }
    setError(null)
    return true
  }

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (selected && validateFile(selected)) {
      setFile(selected)
      if (!titre) {
        // Auto fill title without extension
        const nameWithoutExt = selected.name.substring(0, selected.name.lastIndexOf('.')) || selected.name
        setTitre(nameWithoutExt)
      }
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (validateFile(droppedFile)) {
        setFile(droppedFile)
        if (!titre) {
          const nameWithoutExt = droppedFile.name.substring(0, droppedFile.name.lastIndexOf('.')) || droppedFile.name
          setTitre(nameWithoutExt)
        }
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Veuillez sélectionner un fichier à téléverser.')
      return
    }
    if (!titre.trim()) {
      setError('Veuillez entrer un titre pour le document.')
      return
    }
    if (!matiereId) {
      setError('Veuillez sélectionner une matière.')
      return
    }

    setUploading(true)
    setProgress(30)
    setError(null)

    const formData = new FormData()
    formData.append('fichier', file)
    formData.append('titre', titre.trim())
    formData.append('type', typeDoc)
    formData.append('matiere_id', matiereId)
    formData.append('description', description.trim())
    formData.append('annee', annee)

    try {
      const response = await fetchWithAuth(API_BASE, `${API_BASE}/api/library/documents/`, {
        method: 'POST',
        body: formData,
      })

      setProgress(90)

      if (response && response.ok) {
        const data = await response.json()
        setProgress(100)
        setSuccess(true)
        setTimeout(() => {
          if (onUploaded) onUploaded(data)
          if (onSuccess) onSuccess(data)
          handleClose()
        }, 1200)
      } else {
        const errData = await response.json().catch(() => ({}))
        setError(errData.detail || errData.fichier?.[0] || 'Erreur lors du téléversement du document.')
      }
    } catch (err) {
      setError('Une erreur réseau est survenue. Veuillez réessayer.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/80">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-esi-orange/10 p-2 text-esi-orange">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Ajouter un document à la Bibliothèque
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supports de cours, TD, examens ou corrigés (Max 50Mo)
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 p-3.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Document téléversé avec succès ! Redirection…</span>
            </div>
          )}

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative mb-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
              dragActive
                ? 'border-esi-orange bg-esi-orange/5 dark:bg-esi-orange/10'
                : file
                ? 'border-emerald-400 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-950/20'
                : 'border-slate-300 hover:border-esi-orange hover:bg-slate-50 dark:border-gray-600 dark:hover:bg-gray-700/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx,.pptx,.zip"
              className="hidden"
            />

            {file ? (
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <FileText className="h-7 w-7" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{file.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB — Prêt au téléversement
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                  }}
                  className="ml-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="mb-3 rounded-full bg-slate-100 p-3.5 text-slate-500 dark:bg-gray-700 dark:text-slate-300">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Glissez-déposez votre fichier ici, ou <span className="text-esi-orange underline">parcourez</span>
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Formats acceptés : PDF, DOCX, PPTX, ZIP (Max 50Mo)
                </p>
              </>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Titre du document *
              </label>
              <input
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Ex: Chapitre 1 - Introduction au Web Socket"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Type de document *
              </label>
              <select
                value={typeDoc}
                onChange={(e) => setTypeDoc(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="COURS">Support de cours</option>
                <option value="TD">Fiche de TD / TP</option>
                <option value="EXAMEN">Sujet d'examen</option>
                <option value="CORRIGE">Corrigé type</option>
                <option value="PROJET">Sujet de projet</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Matière associée *
              </label>
              <select
                value={matiereId}
                onChange={(e) => setMatiereId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                disabled={loadingMatieres}
                required
              >
                <option value="">-- Choisir la matière --</option>
                {matieres.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code ? `[${m.code}] ` : ''}{m.libelle}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description / Mots-clés (Optionnel)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Précisions sur le contenu du document..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Progress bar */}
          {uploading && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Téléversement en cours...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-gray-700">
                <div
                  className="h-full bg-esi-orange transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-gray-600 dark:text-slate-200 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={uploading || !file || !titre || !matiereId}
              className="inline-flex items-center gap-2 rounded-xl bg-esi-orange px-5 py-2.5 text-sm font-medium text-white shadow-md hover:bg-esi-orange/90 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Enregistrement…</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Publier le document</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
