import { UserCircle } from 'lucide-react'
import { getAuth } from '../../auth'

export default function ProfesseurDashboard() {
  const auth = getAuth()
  const userName = auth?.user?.first_name || auth?.user?.email?.split('@')[0] || 'Professeur'

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)] dark:bg-gray-700 dark:text-esi-orange">
          <UserCircle className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Tableau de bord professeur</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Bienvenue, <span className="font-medium text-slate-800 dark:text-slate-100">{userName}</span>. Accédez à votre espace enseignant.
          </p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-gray-600 dark:bg-gray-800 dark:text-slate-400">
        Contenu du tableau de bord à venir (cours, emploi du temps, documents, etc.).
      </div>
    </div>
  )
}
