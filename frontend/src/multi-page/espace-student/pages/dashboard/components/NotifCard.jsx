import { Card, CardContent } from '@/components/ui/card'

export default function NotifCard({ notif }) {
  return (
    <Card size="sm" className="bg-muted/50 shadow-none">
      <CardContent className="pt-3">
        <div className="flex items-start gap-2">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-foreground" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{notif.titre}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{notif.message}</p>
            <p className="mt-1 text-xs text-muted-foreground/70">{notif.date}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
