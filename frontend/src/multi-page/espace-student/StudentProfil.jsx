import { User } from 'lucide-react'
import { getAuth } from '../../auth'

export default function StudentProfil() {
  const auth = getAuth()
  const user = auth?.user || {}

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
          <User className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Mon profil</h1>
          <p className="text-slate-600">Vos informations personnelles.</p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-medium text-slate-500">Email</dt>
            <dd className="text-slate-900">{user.email || '—'}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Prénom</dt>
            <dd className="text-slate-900">{user.first_name || '—'}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Nom</dt>
            <dd className="text-slate-900">{user.last_name || '—'}</dd>
          </div>
        </dl>
        <p className="mt-6 text-xs text-slate-500">La modification du profil sera disponible prochainement.</p>
      </div>
    </div>
  )
}
