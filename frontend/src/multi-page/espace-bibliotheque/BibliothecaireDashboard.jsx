import { BookMarked } from 'lucide-react'
import { getAuth } from '../../auth'

export default function BibliothecaireDashboard() {
  const auth = getAuth()
  const userName = auth?.user?.first_name || auth?.user?.email?.split('@')[0] || 'Bibliothécaire'

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)]">
          <BookMarked className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Tableau de bord bibliothèque</h1>
          <p className="text-slate-600">
            Bienvenue, <span className="font-medium text-slate-800">{userName}</span>. Accédez aux fonctionnalités de l&apos;espace bibliothèque.
          </p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        Contenu du tableau de bord à venir (prêts, catalogue, etc.).
      </div>
    </div>
  )
}
