import { Link } from 'react-router-dom'
import { BookOpen, FileText } from 'lucide-react'

function SectionCard({ icon: Icon, title, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500">
      <div className="mb-4 inline-flex rounded-xl bg-[var(--color-esi-orange-light)] p-3 text-[var(--color-esi-orange)] dark:bg-gray-700 dark:text-esi-orange">
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <h3 className="mb-2 font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  )
}

export default function DocumentsPage() {
  return (
    <section className="border-t border-slate-200 bg-white py-16 sm:py-20 dark:border-gray-700 dark:bg-gray-800/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="mb-10 text-3xl font-semibold text-slate-900 dark:text-white">Documents</h1>
        <div className="grid gap-6 sm:grid-cols-2">
          <SectionCard
            icon={BookOpen}
            title="Bibliothèque en ligne"
            description="Supports de cours, mémoires et ressources documentaires de l'école."
          />
          <SectionCard
            icon={FileText}
            title="Documents officiels"
            description="Règlements, formulaires et documents administratifs."
          />
        </div>
        <p className="mt-10">
          <Link
            to="/"
            className="text-sm font-medium text-[var(--color-esi-primary)] hover:underline dark:text-esi-orange"
          >
            ← Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </section>
  )
}
