import { MapPin, User2 } from 'lucide-react'
import { DASHBOARD_TYPE_COLORS } from '../../../constants/typeStyles'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function TimetableRow({ slot }) {
  const badge = DASHBOARD_TYPE_COLORS[slot.type] || 'bg-muted text-muted-foreground'
  return (
    <Card size="sm" className="bg-muted/50 shadow-none">
      <CardContent className="flex flex-col gap-2 pt-3 sm:flex-row sm:items-start sm:gap-3">
        <div className="flex items-center justify-between sm:block sm:min-w-14 sm:text-center">
          <p className="text-xs font-semibold text-foreground">
            {slot.heure_debut} <span className="text-muted-foreground">→</span> {slot.heure_fin}
          </p>
          <Badge variant="secondary" className={`shrink-0 sm:hidden ${badge}`}>{slot.type}</Badge>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">{slot.matiere}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{slot.salle}</span>
            <span className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1">
              <User2 className="h-3 w-3" />
              <span className="max-w-[120px] truncate sm:max-w-none">{slot.professeur}</span>
            </span>
          </div>
        </div>
        <Badge variant="secondary" className={`hidden shrink-0 sm:inline-flex ${badge}`}>{slot.type}</Badge>
      </CardContent>
    </Card>
  )
}
