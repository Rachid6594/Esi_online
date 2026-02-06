import { BookMarked } from 'lucide-react'

export default function AdminBibliothecaires() {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)]">
          <BookMarked className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Gestion des bibliothécaires</h1>
          <p className="text-slate-600">Comptes et accès des bibliothécaires à l&apos;espace bibliothèque.</p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-500">Contenu à venir : liste des bibliothécaires, création de comptes et permissions.</p>
      </div>
    </div>
  )
}
