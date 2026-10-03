import { useState, useEffect, useCallback, useRef } from 'react'
import { Upload, FileText, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { fetchWithAuth, getAccessToken } from '../../../../../auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export default function StudentUploadPanel({ onUploaded }) {
  const [perm, setPerm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [titre, setTitre] = useState('')
  const [type, setType] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef(null)

  const loadPerm = useCallback(() => {
    setLoading(true)
    fetchWithAuth(API_BASE, `${API_BASE}/api/eleve/me/upload-permission/`)
      .then((r) => (r && r.ok ? r.json() : null))
      .then((data) => setPerm(data))
      .catch(() => setPerm(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadPerm()
  }, [loadPerm])

  if (loading || !perm?.allowed) return null

  const types = perm.types_autorises || []

  // ── Validation ──────────────────────────────────────────────────────────────
  const ALLOWED_EXTS = ['.pdf', '.docx', '.pptx']
  const MAX_SIZE_MB = 50

  const validateFile = (f) => {
    const ext = '.' + f.name.split('.').pop().toLowerCase()
    if (!ALLOWED_EXTS.includes(ext)) {
      setMsg({ type: 'err', text: `Extension non autorisée (${ext}). Acceptés : PDF, DOCX, PPTX.` })
      return false
    }
    if (f.size / (1024 * 1024) > MAX_SIZE_MB) {
      setMsg({ type: 'err', text: `Fichier trop lourd (max ${MAX_SIZE_MB} Mo).` })
      return false
    }
    setMsg(null)
    return true
  }

  // ── Drag & Drop handlers ─────────────────────────────────────────────────────
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true) }
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false) }
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped && validateFile(dropped)) setFile(dropped)
  }
  const handleFileInputChange = (e) => {
    const selected = e.target.files?.[0]
    if (selected && validateFile(selected)) setFile(selected)
  }

  // ── Submit via XHR (with real upload progress) ───────────────────────────────
  function handleSubmit(e) {
    e.preventDefault()
    setMsg(null)
    if (!titre.trim() || !type || !file) {
      setMsg({ type: 'err', text: 'Titre, type et fichier sont requis.' })
      return
    }

    const token = getAccessToken()
    const form = new FormData()
    form.append('titre', titre.trim())
    form.append('type_ressource', type)
    form.append('description', description.trim())
    form.append('fichier', file)

    setBusy(true)
    setProgress(0)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_BASE}/api/eleve/me/upload/`)
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }

    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) {
        setProgress(Math.round((ev.loaded / ev.total) * 100))
      }
    }

    xhr.onload = () => {
      setBusy(false)
      if (xhr.status >= 200 && xhr.status < 300) {
        let data = {}
        try { data = JSON.parse(xhr.responseText) } catch { /* ignore */ }
        setMsg({ type: 'ok', text: data.message || 'Fichier envoyé.' })
        setTitre('')
        setType('')
        setDescription('')
        setFile(null)
        setProgress(0)
        onUploaded?.()
      } else {
        let data = {}
        try { data = JSON.parse(xhr.responseText) } catch { /* ignore */ }
        setMsg({ type: 'err', text: data.detail || `Échec de l'upload (${xhr.status}).` })
      }
    }

    xhr.onerror = () => {
      setBusy(false)
      setMsg({ type: 'err', text: 'Erreur réseau.' })
    }

    xhr.send(form)
  }

  return (
    <Card className="mb-6 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          <CardTitle className="text-base">Déposer un document</CardTitle>
        </div>
        <CardDescription>
          Types autorisés : {types.join(', ')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {msg && (
            <Alert variant={msg.type === 'err' ? 'destructive' : 'default'}>
              <AlertDescription>{msg.text}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="up-titre">Titre</Label>
              <Input
                id="up-titre"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Ex. TD 3 — Complexité"
                disabled={busy}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType} disabled={busy}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir…" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="up-desc">Description (optionnel)</Label>
            <Textarea
              id="up-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              disabled={busy}
            />
          </div>

          {/* Zone Drag & Drop */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
              dragActive
                ? 'border-esi-orange bg-esi-orange/5'
                : file
                ? 'border-emerald-400 bg-emerald-50/50'
                : 'border-slate-300 hover:border-esi-orange hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              accept=".pdf,.docx,.pptx"
              className="hidden"
            />
            {file ? (
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} Mo
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null) }}
                  className="ml-2 rounded-lg p-1 text-slate-400 hover:bg-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="mb-2 h-8 w-8 text-slate-400" />
                <p className="text-sm font-medium text-slate-700">
                  Glissez-déposez, ou <span className="text-esi-orange underline">parcourez</span>
                </p>
                <p className="mt-1 text-xs text-slate-400">PDF, DOCX, PPTX · max 50 Mo</p>
              </>
            )}
          </div>

          {/* Barre de progression */}
          {busy && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Envoi en cours…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-esi-orange transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <Button type="submit" disabled={busy || !file || !titre.trim() || !type}>
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Envoi…
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Uploader
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
