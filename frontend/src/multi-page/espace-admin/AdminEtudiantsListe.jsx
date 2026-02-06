import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, List, Eye, Mail, MoreVertical, Download, RefreshCw } from 'lucide-react'
import { fetchWithAuth } from '../../auth'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export default function AdminEtudiantsListe() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionMenu, setActionMenu] = useState(null)

  function load() {
    setLoading(true)
    fetchWithAuth(API_BASE, `${API_BASE}/api/auth/students/`)
      .then((r) => (r && r.ok ? r.json() : []))
      .then((data) => setStudents(Array.isArray(data) ? data : []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => load(), [])

  function handleExport() {
    fetchWithAuth(API_BASE, `${API_BASE}/api/auth/students/export/`)
      .then((r) => (r && r.ok ? r.blob() : Promise.reject(new Error('Non autorisé'))))
      .then((blob) => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'etudiants.csv'
        a.click()
        URL.revokeObjectURL(a.href)
      })
      .catch(() => {})
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)]">
            <List className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Liste des étudiants</h1>
            <p className="text-slate-600">Vue complète avec actions (export, rafraîchir).</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-70"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-esi-primary)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--color-esi-primary-hover)]"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Chargement…</div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Aucun étudiant. Utilisez la page <Link to="/admin/etudiants/creation" className="text-[var(--color-esi-primary)] hover:underline">Création</Link> pour en ajouter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-slate-600">
                  <th className="p-3">ID</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Prénom</th>
                  <th className="p-3">Nom</th>
                  <th className="p-3">Classe</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3">Inscription</th>
                  <th className="w-12 p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-500">{s.id}</td>
                    <td className="p-3">
                      <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1 text-[var(--color-esi-primary)] hover:underline">
                        <Mail className="h-3.5 w-3.5" />
                        {s.email}
                      </a>
                    </td>
                    <td className="p-3">{s.first_name || '—'}</td>
                    <td className="p-3">{s.last_name || '—'}</td>
                    <td className="p-3">{s.classe_code ? `${s.classe_code}${s.classe_libelle ? ` – ${s.classe_libelle}` : ''}` : '—'}</td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${s.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                        {s.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">
                      {s.date_joined ? new Date(s.date_joined).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="p-3 text-right">
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onClick={() => setActionMenu(actionMenu === s.id ? null : s.id)}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                          aria-label="Actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {actionMenu === s.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActionMenu(null)} />
                            <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                              <a
                                href={`mailto:${s.email}`}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <Mail className="h-4 w-4" /> Envoyer un email
                              </a>
                              <Link
                                to={`/admin/etudiants/recherche`}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                onClick={() => setActionMenu(null)}
                              >
                                <Eye className="h-4 w-4" /> Voir en recherche
                              </Link>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
