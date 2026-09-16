import { Link } from 'react-router-dom'
import { BookOpen, FileText } from 'lucide-react'

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

export default function DocumentsPage() {
  return (
    <section className="border-t border-border bg-card py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="mb-10 text-3xl font-semibold text-foreground">Documents</h1>
        <div className="grid gap-6 sm:grid-cols-2">
          <SectionCard
            icon={BookOpen}
            title="Biblioth�que en ligne"
            description="Supports de cours, m�moires et ressources documentaires de l'�cole."
          />
          <SectionCard
            icon={FileText}
            title="Documents officiels"
            description="R�glements, formulaires et documents administratifs."
          />
        </div>
        <p className="mt-10">
          <Link
            to="/"
            className="text-sm font-medium text-foreground hover:underline text-foreground"
          >
            ? Retour � l&apos;accueil
          </Link>
        </p>
      </div>
    </section>
  )
}
