import { Calendar } from 'lucide-react'

export default function StudentEmploiDuTemps() {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-green-100 p-2.5 text-green-700">
          <Calendar className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Emploi du temps</h1>
          <p className="text-slate-600">Consultez votre planning.</p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        Contenu à venir.
      </div>
    </div>
  )
}
