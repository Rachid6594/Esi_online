import { STAT_CARD_COLORS } from '../../../constants/typeStyles'
import { Card, CardContent } from '@/components/ui/card'

export default function StatCard({ label, value, icon, color }) {
  const Icon = icon
  const cls = STAT_CARD_COLORS[color] || STAT_CARD_COLORS.blue
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center gap-4 pt-6">
        <div className={`rounded-lg p-2.5 ${cls}`}>
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
