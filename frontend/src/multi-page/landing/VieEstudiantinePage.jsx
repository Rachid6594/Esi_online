import { Link } from 'react-router-dom'
import { GraduationCap, Users, Info } from 'lucide-react'

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

export default function VieEstudiantinePage() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="mb-10 text-3xl font-semibold text-slate-900 dark:text-white">Vie estudiantine</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <SectionCard
            icon={GraduationCap}
            title="Activités & événements"
            description="Découvrez les activités, associations et actualités de la vie étudiante à l'ESI."
          />
          <SectionCard
            icon={Users}
            title="Communauté"
            description="Rejoignez les clubs et échangez avec les autres étudiants."
          />
          <SectionCard
            icon={Info}
            title="Informations pratiques"
            description="Horaires, lieux et contacts pour votre quotidien à l'école."
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
