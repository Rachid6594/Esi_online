import { Link } from 'react-router-dom'
import { GraduationCap, Users, Info } from 'lucide-react'

function SectionCard({ icon: Icon, title, description }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-border hover:shadow-md dark:hover:border-gray-500">
      <div className="mb-4 inline-flex rounded-xl bg-muted p-3 text-foreground">
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}

export default function VieEstudiantinePage() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="mb-10 text-3xl font-semibold text-foreground">Vie estudiantine</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <SectionCard
            icon={GraduationCap}
            title="Activités & Événements"
            description="Découvrez les activités, associations et actualités de la vie étudiante — l'ESI."
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
            className="text-sm font-medium text-foreground hover:underline text-foreground"
          >
            ? Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </section>
  )
}
