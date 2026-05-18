import { MapPin, User2 } from 'lucide-react'
import { DASHBOARD_TYPE_COLORS } from '../../../constants/typeStyles'

export default function TimetableRow({ slot }) {
  const badge = DASHBOARD_TYPE_COLORS[slot.type] || 'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-slate-300'
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-start sm:gap-3 dark:border-gray-700 dark:bg-gray-700/50">
      <div className="flex items-center justify-between sm:block sm:min-w-14 sm:text-center">
        <p className="text-xs font-semibold text-slate-900 dark:text-white">{slot.heure_debut} <span className="text-slate-400">→</span> {slot.heure_fin}</p>
        <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium sm:hidden ${badge}`}>{slot.type}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-900 dark:text-white">{slot.matiere}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{slot.salle}</span>
          <span className="hidden sm:inline">·</span>
          <span className="flex items-center gap-1"><User2 className="h-3 w-3" /><span className="truncate max-w-[120px] sm:max-w-none">{slot.professeur}</span></span>
        </div>
      </div>
      <span className={`hidden shrink-0 rounded-md px-2 py-0.5 text-xs font-medium sm:inline ${badge}`}>{slot.type}</span>
    </div>
  )
}
