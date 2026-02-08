import { LayoutDashboard } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)] dark:bg-gray-700 dark:text-esi-orange">
          <LayoutDashboard className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Tableau de bord</h1>
          <p className="text-slate-600 dark:text-slate-300">Bienvenue dans l&apos;espace d&apos;administration ESI Online.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-600 dark:bg-gray-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">À venir</p>
          <p className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100">Statistiques</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Vue d&apos;ensemble et indicateurs.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-600 dark:bg-gray-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">À venir</p>
          <p className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100">Utilisateurs</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Gestion des comptes et rôles.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-600 dark:bg-gray-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">À venir</p>
          <p className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100">Paramètres</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Configuration de la plateforme.</p>
        </div>
      </div>
    </div>
  )
}
