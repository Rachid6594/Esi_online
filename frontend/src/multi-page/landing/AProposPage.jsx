import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Sparkles,
  Building2,
  Target,
  Award,
  Calendar,
  GraduationCap,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  BookOpen,
  FileCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AProposPage() {
  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-[#8B3A3D]/5 via-background to-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#8B3A3D]/20 bg-[#8B3A3D]/5 px-3.5 py-1 text-xs font-semibold text-[#8B3A3D] dark:text-rose-300">
            <Sparkles className="h-3.5 w-3.5 text-[#C45C26]" />
            Institution d&apos;Enseignement Supérieur Public
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
            À propos de l&apos;École Supérieure d&apos;Informatique (ESI)
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-3xl leading-relaxed">
            L&apos;École Supérieure d&apos;Informatique (ESI) est une école publique de référence rattachée à l&apos;<strong>Université Nazi Boni (UNB)</strong> de Bobo-Dioulasso au Burkina Faso, dédiée à la formation de cadres et d&apos;ingénieurs concepteurs en informatique.
          </p>
        </div>

        {/* 3 Main Pillars */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:border-[#8B3A3D]/40 transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B3A3D]/15 to-[#C45C26]/15 text-[#8B3A3D] dark:text-rose-400 mb-4">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Pôle Public d&apos;Excellence</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Installée sur le campus de Nasso à Bobo-Dioulasso, l&apos;ESI allie rigueur scientifique, encadrement qualifié et infrastructures informatiques adaptées aux exigences professionnelles.
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:border-[#C45C26]/40 transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#C45C26]/15 to-[#8B3A3D]/15 text-[#C45C26] dark:text-orange-400 mb-4">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Notre Mission</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Former des analystes et ingénieurs de conception capables d&apos;accompagner la transformation numérique des organisations, des entreprises et de la recherche.
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:border-emerald-500/40 transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#2D6A32]/15 to-[#C45C26]/15 text-[#2D6A32] dark:text-emerald-400 mb-4">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Diplômes Reconnus</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Délivrance de diplômes d&apos;État : Licences professionnelles et diplômes d&apos;Ingénieurs en Informatique reconnus pour leur haut niveau de technicité et d&apos;employabilité.
            </p>
          </div>
        </div>

        {/* Historique détaillé */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8B3A3D]/10 text-[#8B3A3D] dark:text-rose-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Historique de l&apos;Établissement</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Genèse et évolution de l&apos;École Supérieure d&apos;Informatique</p>
            </div>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <p>
              L&apos;École Supérieure d&apos;Informatique (ESI) a été créée en <strong>1991 à Ouagadougou</strong>, à la suite de l&apos;adoption du <strong>Premier Plan Directeur Informatique (1991-1995)</strong> du Burkina Faso. Sa mission initiale était de combler le besoin crucial en ressources humaines qualifiées en informatique et de doter le pays de cadres concepteurs de systèmes d&apos;information.
            </p>
            <p>
              En <strong>septembre 1995</strong>, l&apos;ESI a été transférée et intégrée au sein de l&apos;<strong>Université Polytechnique de Bobo-Dioulasso</strong> (aujourd&apos;hui <strong>Université Nazi Boni - UNB</strong>).
            </p>
            <p>
              Au cours de son développement, l&apos;école a bénéficié de coopérations institutionnelles et de partenariats majeurs, notamment avec la <strong>Délégation Générale à l&apos;Informatique (DELGI)</strong>, la <strong>Coopération Française</strong>, <strong>AWA International</strong> et l&apos;ONG irlandaise <strong>APSO</strong>.
            </p>
          </div>
        </div>

        {/* Offre de formation & Admission */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Formations */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2.5 text-lg font-bold text-foreground">
              <GraduationCap className="h-5 w-5 text-[#8B3A3D] dark:text-rose-400" />
              <span>Formations & Diplômes Dispensés</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Les enseignements sont dispensés en formation initiale (cours du jour) avec un accent fort sur les travaux pratiques et les projets :
            </p>
            <ul className="space-y-3 pt-2">
              <li className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="h-4 w-4 text-[#8B3A3D] mt-0.5 shrink-0" />
                <div>
                  <strong className="text-foreground">Licence Professionnelle en Informatique :</strong>
                  <p className="text-muted-foreground text-xs mt-0.5">Tronc commun scientifique suivi d&apos;une spécialisation en systèmes d&apos;information, développement logiciel et administration réseau.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="h-4 w-4 text-[#8B3A3D] mt-0.5 shrink-0" />
                <div>
                  <strong className="text-foreground">Diplôme d&apos;Ingénieur en Informatique :</strong>
                  <p className="text-muted-foreground text-xs mt-0.5">Conception avancée des systèmes d&apos;information, architecture logicielle, bases de données distribuées et sécurité informatique.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="h-4 w-4 text-[#8B3A3D] mt-0.5 shrink-0" />
                <div>
                  <strong className="text-foreground">Stages & Mémoires professionnels :</strong>
                  <p className="text-muted-foreground text-xs mt-0.5">Immersion obligatoire en entreprise avec soutenance publique devant un jury universitaire et professionnel.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Admission */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2.5 text-lg font-bold text-foreground">
              <FileCheck className="h-5 w-5 text-[#C45C26] dark:text-orange-400" />
              <span>Conditions d&apos;Admission & Inscription</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              L&apos;accès à l&apos;ESI est soumis à des critères d&apos;excellence académique :
            </p>
            <ul className="space-y-3 pt-2">
              <li className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="h-4 w-4 text-[#C45C26] mt-0.5 shrink-0" />
                <div>
                  <strong className="text-foreground">Profils éligibles :</strong>
                  <p className="text-muted-foreground text-xs mt-0.5">Titulaires d&apos;un Baccalauréat scientifique ou technique (Séries C, D, E, F2, F3 ou équivalents reconnus).</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="h-4 w-4 text-[#C45C26] mt-0.5 shrink-0" />
                <div>
                  <strong className="text-foreground">Orientation nationale :</strong>
                  <p className="text-muted-foreground text-xs mt-0.5">Candidatures et inscriptions via la plateforme officielle <strong>Campus Faso</strong>.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="h-4 w-4 text-[#C45C26] mt-0.5 shrink-0" />
                <div>
                  <strong className="text-foreground">Épreuves du concours / test d&apos;entrée :</strong>
                  <p className="text-muted-foreground text-xs mt-0.5">Mathématiques 1 & 2, Physique, Français et Anglais.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact & Localisation */}
        <div className="rounded-3xl bg-gradient-to-r from-[#4A1D20] via-[#8B3A3D] to-[#C45C26] p-8 sm:p-10 text-white shadow-xl">
          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-white">Coordonnées & Secrétariat</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Pour toute demande d&apos;information relative aux formations, aux admissions ou aux partenariats académiques :
              </p>
              <div className="space-y-2 pt-2 text-sm text-white/90">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-orange-300 shrink-0" />
                  <span>Université Nazi Boni (UNB), Bobo-Dioulasso, Burkina Faso</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-orange-300 shrink-0" />
                  <span>(+226) 20 97 27 64</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-orange-300 shrink-0" />
                  <span>infoesi@univ-bobo.gov.bf</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 justify-center">
              <Button asChild size="lg" className="bg-white text-[#8B3A3D] hover:bg-orange-50 font-bold">
                <a href="https://www.campusfaso.bf" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2">
                  <span>Accéder à Campus Faso</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 font-semibold backdrop-blur">
                <a href="https://www.facebook.com/esi.unb.bf" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2">
                  <span>Page Officielle Facebook</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Back Link */}
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


