import { useState } from 'react'
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import useTimetable from './hooks/useTimetable'
import { JOURS, TODAY } from '../../constants/navigation'
import { TYPE_STYLE } from '../../constants/typeStyles'
import SlotCard from './components/SlotCard'

export default function StudentEmploiDuTemps() {
  const { slots, loading } = useTimetable()
  const [openDay, setOpenDay] = useState(TODAY)
  const byDay = JOURS.reduce((acc, jour) => { acc[jour] = slots.filter((s) => s.jour === jour).sort((a, b) => a.heure_debut.localeCompare(b.heure_debut)); return acc }, {})
  const totalSlots = slots.length

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-green-100 p-2.5 text-green-700 dark:bg-gray-700 dark:text-green-400"><Calendar className="h-7 w-7" strokeWidth={1.5} /></div>
        <div><h1 className="text-xl font-semibold text-slate-900 sm:text-2xl dark:text-white">Emploi du temps</h1><p className="text-sm text-slate-600 sm:text-base dark:text-slate-300">{loading ? '…' : `${totalSlots} séance${totalSlots > 1 ? 's' : ''} cette semaine`}</p></div>
      </div>
      {!loading && <div className="mb-6 flex flex-wrap gap-2">{Object.entries(TYPE_STYLE).map(([type, cls]) => <span key={type} className={`rounded-md border px-2.5 py-0.5 text-xs font-medium ${cls}`}>{type}</span>)}</div>}
      {loading ? (
        <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-gray-700" />)}</div>
      ) : (
        <>
          <div className="hidden sm:grid sm:grid-cols-3 sm:gap-3 md:grid-cols-5">{JOURS.map((jour) => <DayColumn key={jour} jour={jour} slots={byDay[jour]} isToday={jour === TODAY} />)}</div>
          <div className="sm:hidden space-y-2">{JOURS.map((jour) => <MobileDayAccordion key={jour} jour={jour} slots={byDay[jour]} isToday={jour === TODAY} isOpen={openDay === jour} onToggle={() => setOpenDay(openDay === jour ? null : jour)} />)}</div>
        </>
      )}
    </div>
  )
}

function DayColumn({ jour, slots, isToday }) {
  return (
    <div className={`flex flex-col rounded-xl border bg-white dark:bg-gray-800 ${isToday ? 'border-esi-primary shadow-sm' : 'border-slate-200 dark:border-gray-600'}`}>
      <div className={`rounded-t-xl px-2 py-2 text-center text-sm font-semibold ${isToday ? 'bg-esi-primary text-white' : 'bg-slate-50 text-slate-600 dark:bg-gray-700 dark:text-slate-300'}`}>{jour}{isToday && <span className="ml-1 text-xs font-normal opacity-85">· auj.</span>}</div>
      <div className="flex flex-1 flex-col gap-2 p-2">{slots.length === 0 ? <p className="flex-1 py-6 text-center text-xs text-slate-400 dark:text-slate-500">Libre</p> : slots.map((slot) => <SlotCard key={slot.id} slot={slot} />)}</div>
    </div>
  )
}

function MobileDayAccordion({ jour, slots, isToday, isOpen, onToggle }) {
  return (
    <div className={`rounded-xl border ${isToday ? 'border-esi-primary' : 'border-slate-200 dark:border-gray-600'} bg-white dark:bg-gray-800`}>
      <button onClick={onToggle} className={`flex w-full items-center justify-between rounded-t-xl px-4 py-3 ${isToday ? 'bg-esi-primary text-white' : 'bg-slate-50 text-slate-700 dark:bg-gray-700 dark:text-slate-200'} ${!isOpen ? 'rounded-b-xl' : ''}`}>
        <span className="font-semibold">{jour}{isToday && <span className="ml-2 text-xs font-normal opacity-85">Aujourd'hui</span>}</span>
        <div className="flex items-center gap-2"><span className="text-xs opacity-75">{slots.length} séance{slots.length !== 1 ? 's' : ''}</span>{isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</div>
      </button>
      {isOpen && <div className="p-3 space-y-2">{slots.length === 0 ? <p className="py-3 text-center text-sm text-slate-400">Pas de cours.</p> : slots.map((slot) => <SlotCard key={slot.id} slot={slot} expanded />)}</div>}
    </div>
  )
}
