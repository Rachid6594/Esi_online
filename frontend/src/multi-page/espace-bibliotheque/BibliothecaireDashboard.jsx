import { BookMarked } from 'lucide-react'
import { getAuth } from '../../auth'

export default function BibliothecaireDashboard() {
  const auth = getAuth()
  const userName = auth?.user?.first_name || auth?.user?.email?.split('@')[0] || 'Bibliothécaire'

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-muted p-2.5 text-foreground">
          <BookMarked className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Tableau de bord bibliothèque</h1>
          <p className="text-muted-foreground">
            Bienvenue, <span className="font-medium text-foreground">{userName}</span>. Accédez aux fonctionnalités de l&apos;espace bibliothèque.
          </p>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        Contenu du tableau de bord À venir (prêts, catalogue, etc.).
      </div>
    </div>
  )
}
