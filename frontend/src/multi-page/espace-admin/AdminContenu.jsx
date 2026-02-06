import { Layers } from 'lucide-react'

export default function AdminContenu() {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
          <Layers className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Contenu</h1>
          <p className="text-slate-600">Contenu à définir plus tard.</p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        Cette section sera remplie ultérieurement.
      </div>
    </div>
  )
}
