import { MapPin, User2 } from 'lucide-react'
import { TYPE_STYLE } from '../../../constants/typeStyles'

export default function SlotCard({ slot, expanded = false }) {
  const cls = TYPE_STYLE[slot.type] || 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-gray-700 dark:text-slate-300 dark:border-gray-600'
  return (
    <div className={`rounded-lg border p-2 text-xs ${cls}`}>
      <p className="font-semibold leading-snug">{slot.matiere}</p>
      <p className="mt-1 opacity-80">{slot.heure_debut} – {slot.heure_fin}</p>
      <p className="mt-0.5 flex items-center gap-1 opacity-70"><MapPin className="h-2.5 w-2.5 shrink-0" />{slot.salle}</p>
      {expanded && <p className="mt-0.5 flex items-center gap-1 opacity-70"><User2 className="h-2.5 w-2.5 shrink-0" /><span className="truncate">{slot.professeur}</span></p>}
      <span className="mt-1 inline-block rounded bg-white/30 px-1.5 py-0.5 text-[10px] font-medium dark:bg-black/20">{slot.type}</span>
    </div>
  )
}
