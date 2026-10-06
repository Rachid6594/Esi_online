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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-md text-white"
               style={{ background: 'linear-gradient(135deg, var(--color-esi-primary) 0%, var(--color-esi-orange) 100%)' }}>
            <UserCircle className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              Espace Enseignant
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Bienvenue, <span className="font-semibold text-slate-700 dark:text-slate-200">{userName}</span>. Déposez vos supports et suivez leur consultation.
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-gray-700 dark:bg-gray-800/80 overflow-x-auto max-w-full shadow-xs">
          <button
            onClick={() => setCurrentTab('explorer')}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 sm:px-4 py-2 text-xs font-semibold transition-all duration-200 ${
              currentTab === 'explorer'
                ? 'text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700'
            }`}
            style={currentTab === 'explorer' ? {
              background: 'linear-gradient(135deg, var(--color-esi-primary) 0%, #6B2D30 100%)',
              boxShadow: '0 2px 8px rgba(139, 58, 61, 0.35)'
            } : {}}
          >
            <FolderTree className="h-4 w-4" />
            <span className="hidden sm:inline">Mes Documents &amp; Supports</span>
            <span className="sm:hidden">Documents</span>
          </button>
          <button
            onClick={() => setCurrentTab('stats')}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 sm:px-4 py-2 text-xs font-semibold transition-all duration-200 ${
              currentTab === 'stats'
                ? 'text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700'
            }`}
            style={currentTab === 'stats' ? {
              background: 'linear-gradient(135deg, var(--color-esi-orange) 0%, var(--color-esi-orange-hover) 100%)',
              boxShadow: '0 2px 8px rgba(196, 92, 38, 0.35)'
            } : {}}
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Suivi Téléchargements</span>
            <span className="sm:hidden">Statistiques</span>
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
