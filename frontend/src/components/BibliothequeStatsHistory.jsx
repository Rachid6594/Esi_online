import { useState, useEffect } from 'react'
import { History, BarChart3, Download, User, Calendar, BookOpen, FileText } from 'lucide-react'
import { fetchWithAuth } from '../auth'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export default function BibliothequeStatsHistory({ userRole = 'user' }) {
  const [activeTab, setActiveTab] = useState('history') // 'history' | 'teacher_stats'
  const [myDownloads, setMyDownloads] = useState([])
  const [teacherStats, setTeacherStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    if (activeTab === 'history') {
      fetchWithAuth(API_BASE, `${API_BASE}/api/library/my-downloads/`)
        .then((r) => (r && r.ok ? r.json() : []))
        .then((data) => setMyDownloads(Array.isArray(data) ? data : []))
        .catch(() => setMyDownloads([]))
        .finally(() => setLoading(false))
    } else {
      fetchWithAuth(API_BASE, `${API_BASE}/api/library/teacher-stats/`)
        .then((r) => (r && r.ok ? r.json() : []))
        .then((data) => setTeacherStats(Array.isArray(data) ? data : []))
        .catch(() => setTeacherStats([]))
        .finally(() => setLoading(false))
    }
  }, [activeTab])

  const isTeacherOrAdmin = userRole === 'professeur' || userRole === 'admin' || userRole === 'admin_ecole' || userRole === 'bibliothecaire'

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'history'
              ? 'bg-esi-orange text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-gray-700 dark:text-slate-300'
          }`}
        >
          <History className="h-4 w-4" />
          <span>Mes Téléchargements</span>
        </button>

        {isTeacherOrAdmin && (
          <button
            onClick={() => setActiveTab('teacher_stats')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'teacher_stats'
                ? 'bg-esi-orange text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-gray-700 dark:text-slate-300'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Statistiques Enseignant</span>
          </button>
        )}
      </div>

      {/* Tab 1: My Downloads */}
      {activeTab === 'history' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
            Historique récent de vos téléchargements
          </h3>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500">Chargement…</div>
          ) : myDownloads.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Aucun téléchargement enregistré pour le moment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600 dark:border-gray-700 dark:bg-gray-700/50 dark:text-slate-300">
                    <th className="px-4 py-3 font-medium">Document</th>
                    <th className="px-4 py-3 font-medium">Matière</th>
                    <th className="px-4 py-3 font-medium">Auteur</th>
                    <th className="px-4 py-3 font-medium">Date de téléchargement</th>
                  </tr>
                </thead>
                <tbody>
                  {myDownloads.map((dl) => (
                    <tr
                      key={dl.id}
                      className="border-b border-slate-100 hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-gray-700/40"
                    >
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                        {dl.document_titre}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {dl.matiere_libelle || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {dl.auteur_nom || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(dl.date).toLocaleString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Teacher Stats */}
      {activeTab === 'teacher_stats' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
            Suivi des consultations de vos documents déposés
          </h3>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500">Chargement…</div>
          ) : teacherStats.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Aucun document déposé ou téléchargé.
            </div>
          ) : (
            <div className="space-y-4">
              {teacherStats.map((stat) => (
                <div
                  key={stat.document_id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-700/30"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2 dark:border-gray-600">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {stat.titre}
                      </h4>
                      <span className="text-xs text-slate-500">{stat.matiere_libelle}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-esi-orange/10 px-3 py-1 text-xs font-semibold text-esi-orange">
                        {stat.nb_telechargements} téléchargement(s)
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h5 className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Derniers utilisateurs ayant téléchargé :
                    </h5>
                    {stat.utilisateurs && stat.utilisateurs.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {stat.utilisateurs.map((u, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-700 shadow-2xs dark:border-gray-600 dark:bg-gray-800 dark:text-slate-200"
                          >
                            <User className="h-3 w-3 text-slate-400" />
                            <span>{u.utilisateur_nom}</span>
                            <span className="text-[10px] text-slate-400">
                              ({new Date(u.date).toLocaleDateString('fr-FR')})
                            </span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs italic text-slate-400">Pas encore téléchargé par des étudiants.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
