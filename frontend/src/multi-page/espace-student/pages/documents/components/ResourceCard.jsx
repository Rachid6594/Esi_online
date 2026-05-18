import { BookOpen, Calendar, Download, Loader2 } from 'lucide-react'
import { TYPE_CONFIG, DEFAULT_TYPE_CONFIG } from '../../../constants/typeStyles'

export default function ResourceCard({ resource, onDownload, downloading, index }) {
  const config = TYPE_CONFIG[resource.type] || DEFAULT_TYPE_CONFIG
  const TypeIcon = config.icon
  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-3 transition-all duration-200 hover:border-esi-primary/25 hover:shadow-lg hover:shadow-esi-primary/5 sm:p-4 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-esi-primary/30" style={{ animationDelay: `${index * 30}ms` }}>
      {/* Mobile: stacked layout */}
      <div className="flex items-start gap-3 sm:items-center sm:gap-4">
        <div className={`shrink-0 rounded-lg p-2 sm:p-2.5 ${config.bg} ring-1 ${config.border} transition-transform duration-200 group-hover:scale-105`}><TypeIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${config.text}`} strokeWidth={1.5} /></div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug text-slate-800 group-hover:text-slate-900 sm:truncate sm:text-base dark:text-slate-100 dark:group-hover:text-white">{resource.titre}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3 opacity-50" />{resource.matiere}</span>
            <span className="hidden sm:inline">·</span><span className="hidden sm:inline">{resource.professeur}</span>
            <span className="hidden md:inline">·</span><span className="hidden items-center gap-1 md:inline-flex"><Calendar className="h-3 w-3 opacity-50" />{resource.date}</span>
            {resource.annee && <><span className="hidden md:inline">·</span><span className="hidden rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 md:inline dark:bg-gray-700 dark:text-slate-400">{resource.annee}</span></>}
          </div>
        </div>
        {/* Type badge + size — hidden on mobile */}
        <span className={`hidden shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold lg:inline-flex ${config.bg} ${config.text} ring-1 ${config.border}`}><span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />{resource.type}</span>
        <span className="hidden shrink-0 text-xs text-slate-400 xl:inline dark:text-slate-500">{resource.taille}</span>
        {/* Download button */}
        <button onClick={onDownload} disabled={downloading} className="shrink-0 flex items-center gap-1.5 rounded-lg bg-esi-primary p-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-esi-primary-hover hover:shadow-md disabled:opacity-60 sm:px-3.5 sm:py-2">
          {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}<span className="hidden sm:inline">{downloading ? 'En cours…' : 'Télécharger'}</span>
        </button>
      </div>
      {/* Mobile-only: type badge row */}
      <div className="mt-2 flex items-center justify-between sm:hidden">
        <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold ${config.bg} ${config.text} ring-1 ${config.border}`}><span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />{resource.type}</span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">{resource.taille}</span>
      </div>
    </div>
  )
}
