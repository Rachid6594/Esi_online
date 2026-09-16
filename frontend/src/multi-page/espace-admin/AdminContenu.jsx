import { Layers } from 'lucide-react'

export default function AdminContenu() {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-muted p-2.5 text-muted-foreground">
          <Layers className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Contenu</h1>
          <p className="text-muted-foreground">Contenu à définir plus tard.</p>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        Cette section sera remplie ultérieurement.
      </div>
    </div>
  )
}
