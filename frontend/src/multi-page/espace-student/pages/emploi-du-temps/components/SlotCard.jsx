import { MapPin, User2 } from 'lucide-react'
import { TYPE_STYLE } from '../../../constants/typeStyles'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function SlotCard({ slot, expanded = false }) {
  const cls = TYPE_STYLE[slot.type] || 'bg-background text-foreground border-border'
  return (
    <Card size="sm" className={`text-xs shadow-none ${cls}`}>
      <CardContent className="pt-2">
        <p className="font-semibold leading-snug">{slot.matiere}</p>
        <p className="mt-1 opacity-80">{slot.heure_debut} – {slot.heure_fin}</p>
        <p className="mt-0.5 flex items-center gap-1 opacity-70">
          <MapPin className="h-2.5 w-2.5 shrink-0" />{slot.salle}
        </p>
        {expanded && (
          <p className="mt-0.5 flex items-center gap-1 opacity-70">
            <User2 className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">{slot.professeur}</span>
          </p>
        )}
        <Badge variant="secondary" className="mt-1 bg-card/30 text-[10px] dark:bg-black/20">{slot.type}</Badge>
      </CardContent>
    </Card>
  )
}
