import { FileText } from 'lucide-react'

export default function StudentDocuments() {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-blue-100 p-2.5 text-blue-700">
          <FileText className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Documents</h1>
          <p className="text-slate-600">Téléchargez les documents de votre formation.</p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        Contenu à venir.
      </div>
    </div>
  )
}
