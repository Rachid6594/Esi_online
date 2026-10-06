import { useState } from 'react'
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import useTimetable from './hooks/useTimetable'
import { JOURS, TODAY } from '../../constants/navigation'
import { TYPE_STYLE } from '../../constants/typeStyles'
import SlotCard from './components/SlotCard'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function StudentEmploiDuTemps() {
  const { slots, loading } = useTimetable()
  const [openDay, setOpenDay] = useState(TODAY)
  const byDay = JOURS.reduce((acc, jour) => {
    acc[jour] = slots.filter((s) => s.jour === jour).sort((a, b) => a.heure_debut.localeCompare(b.heure_debut))
    return acc
  }, {})
  const totalSlots = slots.length

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B3A3D] to-[#C45C26] text-white shadow-md shadow-[#8B3A3D]/20">
            <Calendar className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">
              Emploi du temps
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {loading ? 'Chargement…' : `${totalSlots} séance${totalSlots > 1 ? 's' : ''} cette semaine`}
            </p>
          </div>
        </div>

        {!loading && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(TYPE_STYLE).map(([type, cls]) => (
              <Badge key={type} variant="outline" className={`border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{type}</Badge>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="hidden sm:grid sm:grid-cols-3 sm:gap-3 md:grid-cols-5">
            {JOURS.map((jour) => (
              <DayColumn key={jour} jour={jour} slots={byDay[jour]} isToday={jour === TODAY} />
            ))}
          </div>
          <div className="space-y-2 sm:hidden">
            {JOURS.map((jour) => (
              <MobileDayAccordion
                key={jour}
                jour={jour}
                slots={byDay[jour]}
                isToday={jour === TODAY}
                isOpen={openDay === jour}
                onToggle={() => setOpenDay(openDay === jour ? null : jour)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function DayColumn({ jour, slots, isToday }) {
  return (
    <Card className={`flex flex-col overflow-hidden rounded-2xl shadow-sm transition-all ${isToday ? 'border-[#8B3A3D] ring-1 ring-[#8B3A3D]/30 shadow-md shadow-[#8B3A3D]/10' : 'border-border/80'}`}>
      <CardHeader className={`rounded-t-2xl px-2 py-2.5 text-center ${isToday ? 'bg-gradient-to-r from-[#8B3A3D] to-[#C45C26] text-white' : 'bg-muted'}`}>
        <p className="text-sm font-bold">
          {jour}
          {isToday && <span className="ml-1 text-xs font-normal opacity-85">· auj.</span>}
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 p-2 pt-2">
        {slots.length === 0 ? (
          <p className="flex-1 py-6 text-center text-xs text-muted-foreground">Libre</p>
        ) : (
          slots.map((slot) => <SlotCard key={slot.id} slot={slot} />)
        )}
      </CardContent>
    </Card>
  )
}

function MobileDayAccordion({ jour, slots, isToday, isOpen, onToggle }) {
  return (
    <Card className={`overflow-hidden rounded-2xl shadow-sm ${isToday ? 'border-[#8B3A3D] ring-1 ring-[#8B3A3D]/30' : 'border-border/80'}`}>
      <Button
        variant="ghost"
        onClick={onToggle}
        className={`flex h-auto w-full items-center justify-between rounded-t-2xl px-4 py-3.5 ${isToday ? 'bg-gradient-to-r from-[#8B3A3D] to-[#C45C26] text-white hover:from-[#722F31] hover:to-[#A34D1F] hover:text-white' : 'bg-muted hover:bg-muted/80'} ${!isOpen ? 'rounded-b-2xl' : ''}`}
      >
        <span className="font-bold">
          {jour}
          {isToday && <span className="ml-2 text-xs font-normal opacity-85">Aujourd&apos;hui</span>}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-80 font-medium">{slots.length} séance{slots.length !== 1 ? 's' : ''}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </Button>
      {isOpen && (
        <CardContent className="space-y-2 p-3 pt-2">
          {slots.length === 0 ? (
            <p className="py-3 text-center text-sm text-muted-foreground">Pas de cours.</p>
          ) : (
            slots.map((slot) => <SlotCard key={slot.id} slot={slot} expanded />)
          )}
        </CardContent>
      )}
    </Card>
  )
}

