import { BookOpen } from 'lucide-react'

export default function StudentCours() {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)]">
          <BookOpen className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Cours</h1>
          <p className="text-slate-600">Vos cours et supports seront disponibles ici.</p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        Contenu à venir.
      </div>
    </div>
  )
}
