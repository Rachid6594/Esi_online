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
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-muted p-2.5 text-foreground">
          <Calendar className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Emploi du temps</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {loading ? '…' : `${totalSlots} séance${totalSlots > 1 ? 's' : ''} cette semaine`}
          </p>
        </div>
      </div>
      {!loading && (
        <div className="mb-6 flex flex-wrap gap-2">
          {Object.entries(TYPE_STYLE).map(([type, cls]) => (
            <Badge key={type} variant="outline" className={`border px-2.5 py-0.5 ${cls}`}>{type}</Badge>
          ))}
        </div>
      )}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
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
    <Card className={`flex flex-col shadow-sm ${isToday ? 'border-primary' : ''}`}>
      <CardHeader className={`rounded-t-xl px-2 py-2 text-center ${isToday ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
        <p className="text-sm font-semibold">
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
    <Card className={`shadow-sm ${isToday ? 'border-primary' : ''}`}>
      <Button
        variant="ghost"
        onClick={onToggle}
        className={`flex h-auto w-full items-center justify-between rounded-t-xl px-4 py-3 ${isToday ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground' : 'bg-muted hover:bg-muted/80'} ${!isOpen ? 'rounded-b-xl' : ''}`}
      >
        <span className="font-semibold">
          {jour}
          {isToday && <span className="ml-2 text-xs font-normal opacity-85">Aujourd'hui</span>}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-75">{slots.length} séance{slots.length !== 1 ? 's' : ''}</span>
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
