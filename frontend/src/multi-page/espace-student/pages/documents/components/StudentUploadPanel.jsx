import { useState, useEffect, useCallback } from 'react'
import { Upload } from 'lucide-react'
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

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg(null)
    if (!titre.trim() || !type || !file) {
      setMsg({ type: 'err', text: 'Titre, type et fichier sont requis.' })
      return
    }
    setBusy(true)
    try {
      const form = new FormData()
      form.append('titre', titre.trim())
      form.append('type_ressource', type)
      form.append('description', description.trim())
      form.append('fichier', file)

      const token = getAccessToken()
      const res = await fetch(`${API_BASE}/api/eleve/me/upload/`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMsg({ type: 'err', text: data.detail || 'Échec de l’upload.' })
        return
      }
      setMsg({ type: 'ok', text: data.message || 'Fichier envoyé.' })
      setTitre('')
      setType('')
      setDescription('')
      setFile(null)
      onUploaded?.()
    } catch {
      setMsg({ type: 'err', text: 'Erreur réseau.' })
    } finally {
      setBusy(false)
    }
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
          <div className="space-y-2">
            <Label htmlFor="up-file">Fichier</Label>
            <Input
              id="up-file"
              type="file"
              disabled={busy}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <Button type="submit" disabled={busy}>
            <Upload className="h-4 w-4" />
            {busy ? 'Envoi…' : 'Uploader'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
