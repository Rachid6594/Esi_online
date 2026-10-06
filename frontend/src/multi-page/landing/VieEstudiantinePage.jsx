import { Link } from 'react-router-dom'
import { GraduationCap, Users, Info, ArrowLeft, Sparkles, Trophy, Calendar, Laptop, HeartHandshake } from 'lucide-react'
import { Button } from '@/components/ui/button'

function SectionCard({ icon: Icon, title, description, badge, color }) {
  return (
    <div className="group rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-300 hover:border-[#8B3A3D]/40 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white group-hover:scale-110 transition-transform`}>
          <Icon className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-muted text-foreground">
          {badge}
        </span>
      </div>
      <h3 className="mb-2 text-xl font-bold text-foreground group-hover:text-[#8B3A3D] dark:group-hover:text-rose-400 transition-colors">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}

export default function VieEstudiantinePage() {
  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-[#8B3A3D]/5 via-background to-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C45C26]/25 bg-[#C45C26]/5 px-3.5 py-1 text-xs font-semibold text-[#C45C26] mb-1">
            <Sparkles className="h-3 w-3" />
            Campus de Nasso — Université Nazi Boni
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Vie Estudiantine à l&apos;ESI
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl text-sm sm:text-base leading-relaxed">
            Un écosystème étudiant dynamique qui favorise le travail d&apos;équipe, les projets innovants, l&apos;entraide académique et le bien-être sur le campus de Bobo-Dioulasso.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <SectionCard
            icon={Laptop}
            title="Clubs Informatiques & IA"
            description="Rejoignez les clubs de développement web/mobile, cybersécurité, logiciels libres, data science et robotique animés par les étudiants."
            badge="Innovation"
            color="from-[#8B3A3D] to-[#C45C26]"
          />
          <SectionCard
            icon={Trophy}
            title="Hackathons & Compétitions"
            description="Participation active aux hackathons nationaux, concours de programmation algorithmique et journées d'émulation scientifique."
            badge="Compétitions"
            color="from-[#C45C26] to-[#E07A45]"
          />
          <SectionCard
            icon={HeartHandshake}
            title="Vie Associative & Entraide"
            description="Association des étudiants de l'ESI, parrainage des nouveaux arrivants, séances de tutorat et intégration sur le campus de l'UNB."
            badge="Communauté"
            color="from-[#2D6A32] to-[#439B4A]"
          />
        </div>

        <div className="rounded-2xl border border-border bg-muted/30 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-foreground text-base">Accéder à la Bibliothèque Numérique</h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Consultez les supports de cours, travaux dirigés, annales d&apos;examens et mémoires partagés pour vos révisions.
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-[#8B3A3D] to-[#C45C26] text-white shrink-0">
            <Link to="/documents">Explorer les documents</Link>
          </Button>
        </div>

        <div className="border-t border-border pt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B3A3D] dark:text-rose-400 hover:text-[#C45C26] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </section>
  )
}


