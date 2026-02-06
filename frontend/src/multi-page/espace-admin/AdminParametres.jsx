import { Settings } from 'lucide-react'

export default function AdminParametres() {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)]">
          <Settings className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Paramètres</h1>
          <p className="text-slate-600">Configuration générale de la plateforme ESI Online.</p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-500">Contenu à venir : préférences, notifications, maintenance et sécurité.</p>
      </div>
    </div>
  )
}
