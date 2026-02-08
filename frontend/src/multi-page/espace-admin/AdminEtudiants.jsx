import { useState, useEffect } from 'react'
import { GraduationCap, UserPlus, Upload, FileSpreadsheet, Download } from 'lucide-react'
import { fetchWithAuth } from '../../auth'

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

export default function AdminEtudiantsCreation() {
  const [classes, setClasses] = useState([])
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', classe_id: '' })
  const [formMsg, setFormMsg] = useState({ type: '', text: '' })
  const [formLoading, setFormLoading] = useState(false)
  const [csvFile, setCsvFile] = useState(null)
  const [csvMsg, setCsvMsg] = useState({ type: '', text: '', details: null })
  const [csvLoading, setCsvLoading] = useState(false)

  useEffect(() => {
    fetchWithAuth(API_BASE, `${API_BASE}/api/etablissement/classes/`)
      .then((r) => (r && r.ok ? r.json() : []))
      .then((data) => setClasses(Array.isArray(data) ? data : []))
      .catch(() => setClasses([]))
  }, [])

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
      if (!res) {
        setFormLoading(false)
        return
      }
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
    } catch (err) {
      setFormMsg({ type: 'error', text: 'Erreur réseau.' })
    } finally {
      setFormLoading(false)
    }
  }

  async function handleImportCsv(e) {
    e.preventDefault()
    if (!csvFile) {
      setCsvMsg({ type: 'error', text: 'Choisissez un fichier CSV.' })
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
      if (!res) {
        setCsvLoading(false)
        return
      }
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setCsvMsg({ type: 'error', text: data.detail || 'Erreur lors de l\'import.' })
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
    } catch (err) {
      setCsvMsg({ type: 'error', text: 'Erreur réseau.' })
    } finally {
      setCsvLoading(false)
    }
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)]">
          <GraduationCap className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Création d&apos;étudiants</h1>
          <p className="text-slate-600">
            Créez des comptes étudiants (un par un ou import CSV). Mot de passe aléatoire, identifiants envoyés par email avec lien pour changer le mot de passe.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Formulaire : créer un étudiant */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <UserPlus className="h-5 w-5" strokeWidth={1.5} />
            Créer un étudiant
          </h2>
          <p className="mb-3 text-xs text-slate-500">
            L&apos;email avec les identifiants est envoyé à l&apos;<strong>adresse email de l&apos;étudiant</strong> (celle que vous saisissez ci‑dessous). Vérifiez aussi les spams.
          </p>
          <form onSubmit={handleCreateStudent} className="space-y-4">
            {formMsg.text && (
              <div
                className={`rounded-lg px-4 py-2.5 text-sm ${
                  formMsg.type === 'success'
                    ? 'bg-green-50 text-green-800'
                    : formMsg.type === 'warning'
                    ? 'bg-amber-50 text-amber-800'
                    : formMsg.type === 'error'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {formMsg.text}
              </div>
            )}
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-[var(--color-esi-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-esi-primary)]/20"
              />
            </div>
            <div>
              <label htmlFor="first_name" className="mb-1 block text-sm font-medium text-slate-700">
                Prénom
              </label>
              <input
                id="first_name"
                type="text"
                value={form.first_name}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-[var(--color-esi-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-esi-primary)]/20"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="mb-1 block text-sm font-medium text-slate-700">
                Nom
              </label>
              <input
                id="last_name"
                type="text"
                value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-[var(--color-esi-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-esi-primary)]/20"
              />
            </div>
            <div>
              <label htmlFor="classe" className="mb-1 block text-sm font-medium text-slate-700">
                Classe (optionnel)
              </label>
              <select
                id="classe"
                value={form.classe_id}
                onChange={(e) => setForm((f) => ({ ...f, classe_id: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-[var(--color-esi-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-esi-primary)]/20"
              >
                <option value="">— Aucune —</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.libelle || c.code}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">Définir les classes dans Gestion de l&apos;établissement.</p>
            </div>
            <button
              type="submit"
              disabled={formLoading}
              className="rounded-lg bg-[var(--color-esi-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-esi-primary-hover)] disabled:opacity-70"
            >
              {formLoading ? 'Création…' : 'Créer et envoyer les identifiants par email'}
            </button>
          </form>
        </div>

        {/* Import CSV */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Upload className="h-5 w-5" strokeWidth={1.5} />
            Importer un CSV
          </h2>
          <p className="mb-3 text-sm text-slate-600">
            Format attendu : une ligne d’en-tête optionnelle <code className="rounded bg-slate-100 px-1">email,prenom,nom,classe_id</code> (classe_id optionnel). Encodage UTF-8.
          </p>
          <div className="mb-4 flex items-center gap-2">
            <button
              type="button"
              onClick={downloadExampleCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Télécharger un exemple
            </button>
          </div>
          <form onSubmit={handleImportCsv} className="space-y-4">
            {csvMsg.text && (
              <div
                className={`rounded-lg px-4 py-2.5 text-sm ${
                  csvMsg.type === 'success'
                    ? 'bg-green-50 text-green-800'
                    : csvMsg.type === 'error'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-amber-50 text-amber-800'
                }`}
              >
                {csvMsg.text}
                {csvMsg.details && csvMsg.details.length > 0 && (
                  <ul className="mt-2 list-inside list-disc text-xs">
                    {csvMsg.details.slice(0, 5).map((err, i) => (
                      <li key={i}>
                        Ligne {err.ligne} {err.email && `(${err.email})`} : {err.erreur}
                      </li>
                    ))}
                    {csvMsg.details.length > 5 && (
                      <li>… et {csvMsg.details.length - 5} autre(s) erreur(s)</li>
                    )}
                  </ul>
                )}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-slate-600 file:mr-2 file:rounded-lg file:border-0 file:bg-[var(--color-esi-primary-light)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[var(--color-esi-primary)]"
              />
            </div>
            <button
              type="submit"
              disabled={csvLoading || !csvFile}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-esi-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-esi-primary-hover)] disabled:opacity-70"
            >
              <FileSpreadsheet className="h-4 w-4" />
              {csvLoading ? 'Import en cours…' : 'Importer et envoyer les emails'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
