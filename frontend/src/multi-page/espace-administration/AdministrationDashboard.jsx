import { Building2 } from 'lucide-react'
import { getAuth } from '../../auth'

export default function AdministrationDashboard() {
  const auth = getAuth()
  const user = auth?.user
  const poste = user?.poste
  const displayName = user?.email?.split('@')[0] || user?.username || 'Administration'

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-[var(--color-esi-primary-light)] p-2.5 text-[var(--color-esi-primary)] dark:bg-gray-700 dark:text-esi-primary">
          <Building2 className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Tableau de bord — Administration de l&apos;école
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Bienvenue, <span className="font-medium text-slate-800 dark:text-slate-100">{displayName}</span>
            {poste && (
              <> — <span className="text-slate-600 dark:text-slate-400">{poste}</span></>
            )}.
          </p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-gray-600 dark:bg-gray-800 dark:text-slate-400">
        Espace réservé à l&apos;administration de l&apos;école. Contenu du tableau de bord à définir.
      </div>
    </div>
  )
}
