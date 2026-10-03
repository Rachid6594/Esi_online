import { useState } from 'react'
import { UserCircle, FolderTree, BarChart3 } from 'lucide-react'
import { getAuth } from '../../auth'
import BibliothequeExplorer from '../../components/BibliothequeExplorer'
import BibliothequeStatsHistory from '../../components/BibliothequeStatsHistory'

export default function ProfesseurDashboard() {
  const auth = getAuth()
  const user = auth?.user
  const userName = user?.first_name || user?.email?.split('@')[0] || 'Professeur'
  const [currentTab, setCurrentTab] = useState('explorer') // 'explorer' | 'stats'

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)] dark:bg-gray-700 dark:text-esi-orange">
            <UserCircle className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Espace Enseignant & Gestion des Cours
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Bienvenue, <span className="font-medium text-slate-800 dark:text-slate-100">{userName}</span>. Déposez vos supports et suivez leur consultation.
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1 dark:bg-gray-800">
          <button
            onClick={() => setCurrentTab('explorer')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
              currentTab === 'explorer'
                ? 'bg-white text-esi-orange shadow-sm dark:bg-gray-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
            }`}
          >
            <FolderTree className="h-4 w-4" />
            <span>Mes Documents & Supports</span>
          </button>
          <button
            onClick={() => setCurrentTab('stats')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
              currentTab === 'stats'
                ? 'bg-white text-esi-orange shadow-sm dark:bg-gray-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Suivi Téléchargements</span>
          </button>
        </div>
      </div>

      {currentTab === 'explorer' ? (
        <BibliothequeExplorer canUpload={true} currentUser={user} />
      ) : (
        <BibliothequeStatsHistory userRole="professeur" />
      )}
    </div>
  )
}
