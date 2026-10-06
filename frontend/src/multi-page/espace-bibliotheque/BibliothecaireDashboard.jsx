import { useState } from 'react'
import { BookMarked, FolderTree, History, TrendingUp } from 'lucide-react'
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

      {/* ── Dashboard Header ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* ESI primary colored icon badge */}
          <div className="relative">
            <div className="rounded-xl p-3 shadow-md"
                 style={{ background: 'linear-gradient(135deg, var(--color-esi-primary) 0%, #6B2D30 100%)' }}>
              <BookMarked className="h-6 w-6 text-white" strokeWidth={1.5} />
            </div>
            {/* Orange accent dot */}
            <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--color-esi-orange)] ring-2 ring-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            </span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              Bibliothèque Numérique{' '}
              <span style={{ color: 'var(--color-esi-primary)' }}>ESI</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Bienvenue,{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{userName}</span>.{' '}
              Gestion documentaire et ressources pédagogiques.
            </p>
          </div>
        </div>

        {/* ── Tab Toggle ──────────────────────────────────── */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-gray-700 dark:bg-gray-800/80 overflow-x-auto max-w-full shadow-xs">
          <button
            id="tab-explorer"
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
            <span>Documents & Arborescence</span>
          </button>

          <button
            id="tab-history"
            onClick={() => setCurrentTab('history')}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 sm:px-4 py-2 text-xs font-semibold transition-all duration-200 ${
              currentTab === 'history'
                ? 'text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700'
            }`}
            style={currentTab === 'history' ? {
              background: 'linear-gradient(135deg, var(--color-esi-orange) 0%, var(--color-esi-orange-hover) 100%)',
              boxShadow: '0 2px 8px rgba(196, 92, 38, 0.35)'
            } : {}}
          >
            <History className="h-4 w-4" />
            <span>Historique & Stats</span>
          </button>
        </div>
      </div>

      {/* ── Tab Content ─────────────────────────────────────── */}
      <div className="animate-fade-in" key={currentTab}>
        {currentTab === 'explorer' ? (
          <BibliothequeExplorer canUpload={true} currentUser={user} />
        ) : (
          <BibliothequeStatsHistory userRole={user?.role || 'bibliothecaire'} />
        )}
      </div>
    </div>
  )
}
