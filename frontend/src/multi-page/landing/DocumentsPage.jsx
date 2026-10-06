import { Link } from 'react-router-dom'
import { BookOpen, FileText, ArrowLeft, ArrowRight, Library, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

function SectionCard({ icon: Icon, title, description, href, badge }) {
  return (
    <div className="group rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-300 hover:border-[#8B3A3D]/40 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B3A3D]/15 to-[#C45C26]/15 text-[#8B3A3D] dark:text-orange-400 group-hover:scale-110 transition-transform">
            <Icon className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#8B3A3D]/10 text-[#8B3A3D] dark:text-rose-300">
            {badge}
          </span>
        </div>
        <h3 className="mb-2 text-xl font-bold text-foreground group-hover:text-[#8B3A3D] dark:group-hover:text-rose-400 transition-colors">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>

      <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="p-0 h-auto text-xs font-semibold text-[#8B3A3D] dark:text-rose-300 hover:text-[#C45C26] hover:bg-transparent">
          <Link to={href} className="flex items-center gap-1.5">
            Consulter les documents <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default function DocumentsPage() {
  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-[#8B3A3D]/5 via-background to-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#8B3A3D]/20 bg-[#8B3A3D]/5 px-3.5 py-1 text-xs font-semibold text-[#8B3A3D] dark:text-rose-300 mb-3">
            <Sparkles className="h-3 w-3 text-[#C45C26]" />
            Centre Documentaire & Pédagogique
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Documents & Bibliothèque
          </h1>
          <p className="mt-2 text-muted-foreground max-w-xl text-sm sm:text-base">
            Consultez les supports de cours, les examens passés, fiches de travaux dirigés et les règlements intérieurs.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <SectionCard
            icon={BookOpen}
            title="Bibliothèque en ligne"
            description="Supports de cours officiels, mémoires de fin d'études et ressources documentaires classées par niveau et spécialité."
            badge="Cours & TD"
            href="/login"
          />
          <SectionCard
            icon={FileText}
            title="Documents officiels"
            description="Règlements des études, chartes académiques, calendriers universitaires et formulaires administratifs."
            badge="Administration"
            href="/login"
          />
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B3A3D] dark:text-rose-400 hover:text-[#C45C26] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Retour à l&apos;accueil
          </Link>

          <Button size="sm" asChild className="bg-gradient-to-r from-[#8B3A3D] to-[#C45C26] text-white">
            <Link to="/login">
              <Library className="h-4 w-4" /> Ouvrir l'espace documentaire
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

