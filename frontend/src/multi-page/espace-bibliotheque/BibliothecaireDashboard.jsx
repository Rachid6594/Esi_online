import { useState } from 'react'
import { BookMarked, FolderTree, History } from 'lucide-react'
import { getAuth } from '../../auth'
import BibliothequeExplorer from '../../components/BibliothequeExplorer'
import BibliothequeStatsHistory from '../../components/BibliothequeStatsHistory'

export default function BibliothecaireDashboard() {
  const auth = getAuth()
  const user = auth?.user
  const userName = user?.first_name || user?.email?.split('@')[0] || 'Bibliothécaire'
  const [currentTab, setCurrentTab] = useState('explorer') // 'explorer' | 'history'

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Dashboard Title & Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)] dark:bg-gray-700 dark:text-esi-orange">
            <BookMarked className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
              Bibliothèque Numérique ESI
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Bienvenue, <span className="font-medium text-slate-800 dark:text-slate-100">{userName}</span>. Gestion documentaire et ressources pédagogiques.
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-slate-100 p-1 dark:bg-gray-800 overflow-x-auto max-w-full">
          <button
            onClick={() => setCurrentTab('explorer')}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 sm:px-4 py-2 text-xs font-semibold transition ${
              currentTab === 'explorer'
                ? 'bg-white text-esi-orange shadow-sm dark:bg-gray-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
            }`}
          >
            <FolderTree className="h-4 w-4" />
            <span>Documents & Arborescence</span>
          </button>
          <button
            onClick={() => setCurrentTab('history')}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 sm:px-4 py-2 text-xs font-semibold transition ${
              currentTab === 'history'
                ? 'bg-white text-esi-orange shadow-sm dark:bg-gray-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Historique & Stats</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {currentTab === 'explorer' ? (
        <BibliothequeExplorer canUpload={true} currentUser={user} />
      ) : (
        <BibliothequeStatsHistory userRole={user?.role || 'bibliothecaire'} />
      )}
    </div>
  )
}
