import { BookMarked } from 'lucide-react'

export default function AdminBibliothecaires() {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-muted p-2.5 text-foreground">
          <BookMarked className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Gestion des bibliothécaires</h1>
          <p className="text-muted-foreground">Comptes et accès des bibliothécaires à l&apos;espace bibliothèque.</p>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="text-muted-foreground">Contenu à venir : liste des bibliothécaires, création de comptes et permissions.</p>
      </div>
    </div>
  )
}
