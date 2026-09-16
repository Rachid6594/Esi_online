import { BookOpen, Calendar, Download, Loader2 } from 'lucide-react'
import { TYPE_CONFIG, DEFAULT_TYPE_CONFIG } from '../../../constants/typeStyles'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function ResourceCard({ resource, onDownload, downloading, index }) {
  const config = TYPE_CONFIG[resource.type] || DEFAULT_TYPE_CONFIG
  const TypeIcon = config.icon
  return (
    <Card
      className="group transition-all duration-200 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 dark:hover:border-primary/30"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <CardContent className="pt-4">
        <div className="flex items-start gap-3 sm:items-center sm:gap-4">
          <div className={`shrink-0 rounded-lg p-2 ring-1 transition-transform duration-200 group-hover:scale-105 sm:p-2.5 ${config.bg} ${config.border}`}>
            <TypeIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${config.text}`} strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-snug text-foreground group-hover:text-foreground sm:truncate sm:text-base">{resource.titre}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><BookOpen className="h-3 w-3 opacity-50" />{resource.matiere}</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">{resource.professeur}</span>
              <span className="hidden md:inline">·</span>
              <span className="hidden items-center gap-1 md:inline-flex"><Calendar className="h-3 w-3 opacity-50" />{resource.date}</span>
              {resource.annee && (
                <>
                  <span className="hidden md:inline">·</span>
                  <Badge variant="secondary" className="hidden px-1.5 py-0 text-[10px] md:inline-flex">{resource.annee}</Badge>
                </>
              )}
            </div>
          </div>
          <Badge variant="outline" className={`hidden shrink-0 lg:inline-flex ${config.bg} ${config.text} ring-1 ${config.border}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
            {resource.type}
          </Badge>
          <span className="hidden shrink-0 text-xs text-muted-foreground xl:inline">{resource.taille}</span>
          <Button onClick={onDownload} disabled={downloading} size="sm" className="shrink-0">
            {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{downloading ? 'En cours…' : 'Télécharger'}</span>
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-between sm:hidden">
          <Badge variant="outline" className={`text-[11px] ${config.bg} ${config.text} ring-1 ${config.border}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
            {resource.type}
          </Badge>
          <span className="text-[11px] text-muted-foreground">{resource.taille}</span>
        </div>
      </CardContent>
    </Card>
  )
}
