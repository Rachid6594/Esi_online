import { Building2 } from 'lucide-react'

export default function AdminAdministration() {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)]">
          <Building2 className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Gestion de l&apos;administration</h1>
          <p className="text-slate-600">Utilisateurs et rôles de l&apos;administration (écoles, services).</p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-500">Contenu à venir : gestion des comptes administration et périmètres d&apos;accès.</p>
      </div>
    </div>
  )
}
