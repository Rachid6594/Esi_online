import { Link } from 'react-router-dom'
import { ArrowLeft, GraduationCap, BookOpen, Layers, Users, Award, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function EnseignantsPage() {
  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-[#8B3A3D]/5 via-background to-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#8B3A3D]/20 bg-[#8B3A3D]/5 px-3.5 py-1 text-xs font-semibold text-[#8B3A3D] dark:text-rose-300">
            <Users className="h-3.5 w-3.5 text-[#C45C26]" />
            Corps Professoral & Organisation Pédagogique
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Filières d&apos;Enseignement & Corps Professoral
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl text-sm sm:text-base leading-relaxed">
            L&apos;École Supérieure d&apos;Informatique (ESI) de l&apos;Université Nazi Boni s&apos;appuie sur un corps enseignant composé d&apos;enseignants-chercheurs, d&apos;ingénieurs et d&apos;experts du monde professionnel.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:border-[#8B3A3D]/40 transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B3A3D]/15 to-[#C45C26]/15 text-[#8B3A3D] dark:text-rose-400 mb-4">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Cycle Préparatoire & Tronc Commun</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fondements mathématiques appliqués, algorithmique, structures de données fondamentales, électronique numérique et architecture des ordinateurs.
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:border-[#C45C26]/40 transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#C45C26]/15 to-[#8B3A3D]/15 text-[#C45C26] dark:text-orange-400 mb-4">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Génie Logiciel & Systèmes d&apos;Information</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Conception et modélisation logicielle (UML/Merise), bases de données relationnelles et distribuées, architectures logicielles modernes, web et mobiles.
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:border-emerald-500/40 transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#2D6A32]/15 to-[#C45C26]/15 text-[#2D6A32] dark:text-emerald-400 mb-4">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Réseaux, Systèmes & Sécurité</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Administration système Linux/Windows, protocoles de télécommunications, virtualisation, sécurité des infrastructures informatiques et cloud.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-muted/30 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-foreground text-base">Vous êtes enseignant à l&apos;ESI ?</h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Connectez-vous à votre espace dédié pour déposer vos supports de cours, travaux pratiques et gérer les ressources documentaires de vos promotions.
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-[#8B3A3D] to-[#C45C26] text-white shrink-0">
            <Link to="/login">Accéder à l&apos;espace Enseignant</Link>
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



