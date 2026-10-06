import { Link } from 'react-router-dom'
import {
  GraduationCap,
  Info,
  Users,
  LogIn,
  UserPlus,
  ChevronRight,
  Library,
  ArrowRight,
  Award,
  BookOpen,
  Building,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const features = [
  {
    to: '/documents',
    icon: Library,
    title: 'Bibliothèque Numérique',
    description: "Supports de cours, mémoires, annales d'examens et ressources techniques mis à disposition par les enseignants de l'ESI.",
    tag: 'Ressources & Cours',
    badgeBg: 'bg-[#8B3A3D]/10 text-[#8B3A3D] dark:text-rose-300 dark:bg-[#8B3A3D]/25',
  },
  {
    to: '/a-propos',
    icon: Building,
    title: 'À propos de l\'ESI',
    description: "Créée en 1991, rattachée à l'Université Nazi Boni (UNB) de Bobo-Dioulasso. Historique, missions et filières d'ingénierie.",
    tag: 'Institution & Histoire',
    badgeBg: 'bg-[#C45C26]/10 text-[#C45C26] dark:text-orange-300 dark:bg-[#C45C26]/25',
  },
  {
    to: '/enseignants',
    icon: Users,
    title: 'Filières & Pédagogie',
    description: "Licences professionnelles, cycle ingénieur en systèmes d'information, génie logiciel, réseaux et sécurité informatique.",
    tag: 'Formations & Diplômes',
    badgeBg: 'bg-[#2D6A32]/10 text-[#2D6A32] dark:text-emerald-300 dark:bg-[#2D6A32]/25',
  },
  {
    to: '/vie-estudiantine',
    icon: GraduationCap,
    title: 'Vie Estudiantine',
    description: "Clubs scientifiques, hackathons, associations étudiantes et événements sur le campus de l'Université Nazi Boni.",
    tag: 'Campus & Clubs',
    badgeBg: 'bg-gradient-to-r from-[#8B3A3D]/10 to-[#C45C26]/10 text-[#8B3A3D] dark:text-rose-300',
  },
]

const stats = [
  { label: "Année de création", value: "1991", subtext: "Plan Directeur Informatique" },
  { label: "Rattachement", value: "UNB", subtext: "Université Nazi Boni, Bobo-Dioulasso" },
  { label: "Orientation", value: "Campus Faso", subtext: "Plateforme nationale d'admission" },
  { label: "Diplômes", value: "Licence & Ingénieur", subtext: "Systèmes d'Information & Logiciel" },
]

export default function LandingPage() {
  return (
    <div className="space-y-16 sm:space-y-20 pb-16">
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#8B3A3D]/8 via-background/60 to-background pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-border/50">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#8B3A3D]/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-[#C45C26]/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            {/* Institution Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#8B3A3D]/30 bg-[#8B3A3D]/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#8B3A3D] dark:text-rose-300 mb-6 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#C45C26] animate-pulse" />
              Université Nazi Boni — Bobo-Dioulasso, Burkina Faso
            </div>

            {/* Main heading */}
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground animate-slide-up">
              École Supérieure d&apos;Informatique{' '}
              <span className="block mt-2 bg-gradient-to-r from-[#8B3A3D] via-[#A8483B] to-[#C45C26] bg-clip-text text-transparent">
                ESI Online
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed animate-fade-in delay-100">
              Pôle public d&apos;excellence fondé en 1991 pour la formation d&apos;ingénieurs concepteurs et d&apos;experts en systèmes d&apos;information.
              Accédez à vos cours, travaux dirigés, annales et espaces collaboratifs.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-in delay-150">
              <Button
                size="lg"
                asChild
                className="h-12 px-7 bg-gradient-to-r from-[#8B3A3D] to-[#C45C26] hover:from-[#722F31] hover:to-[#A34D1F] text-white shadow-lg shadow-[#8B3A3D]/25 hover:shadow-xl hover:shadow-[#C45C26]/30 transition-all duration-300 hover:scale-[1.02] text-base font-semibold"
              >
                <Link to="/inscription" className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  S&apos;inscrire
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-12 px-7 border-[#8B3A3D]/40 hover:bg-[#8B3A3D]/10 hover:border-[#8B3A3D] text-foreground font-semibold text-base transition-all duration-200"
              >
                <Link to="/login" className="flex items-center gap-2">
                  <LogIn className="h-5 w-5 text-[#8B3A3D] dark:text-rose-400" />
                  Se connecter
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="lg"
                asChild
                className="h-12 px-5 text-muted-foreground hover:text-foreground font-medium text-base"
              >
                <Link to="/documents" className="flex items-center gap-1.5">
                  Bibliothèque <ArrowRight className="h-4 w-4 text-[#C45C26]" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Key figures strip */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
            {stats.map((s, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-sm p-4 text-center shadow-sm hover:border-[#8B3A3D]/40 transition-colors"
              >
                <div className="text-2xl sm:text-3xl font-black text-[#8B3A3D] dark:text-rose-400">
                  {s.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-foreground mt-1">{s.label}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{s.subtext}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DÉCOUVRIR SECTION ── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
            Explorer la plateforme
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Accédez aux ressources académiques, à l'historique de l'institution et aux activités de l'ESI.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ to, icon: Icon, title, description, tag, badgeBg }) => (
            <Link key={to} to={to} className="group block h-full">
              <Card className="h-full border border-border/80 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-[#8B3A3D]/50 hover:shadow-xl hover:shadow-[#8B3A3D]/10 flex flex-col justify-between overflow-hidden card-shine">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B3A3D]/10 to-[#C45C26]/15 text-[#8B3A3D] dark:text-orange-400 transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-6 w-6" strokeWidth={1.8} />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${badgeBg}`}>
                      {tag}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground group-hover:text-[#8B3A3D] dark:group-hover:text-rose-400 transition-colors">
                    {title}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground leading-relaxed mt-2">
                    {description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8B3A3D] dark:text-rose-300 group-hover:text-[#C45C26] transition-colors">
                    <span>Consulter</span>
                    <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ── PRÉSENTATION INSTITUTIONNELLE & ADMISSION ── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2 items-center rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-sm">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#8B3A3D]/10 px-3 py-1 text-xs font-semibold text-[#8B3A3D] dark:text-rose-300">
              <Award className="h-3.5 w-3.5" /> Pôle de référence nationale
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Formation d&apos;ingénieurs et concepteurs de systèmes
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Créée en 1991 et rattachée à l&apos;Université Nazi Boni (UNB) de Bobo-Dioulasso, l&apos;ESI prépare des informaticiens de haut niveau capables de concevoir, déployer et administrer des architectures logicielles et des infrastructures d'envergure.
            </p>
            <ul className="space-y-2.5 pt-2">
              <li className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-[#8B3A3D] mt-0.5 shrink-0" />
                <span><strong>Licence Professionnelle & Cycle Ingénieur :</strong> Génie logiciel, systèmes d&apos;information et réseaux.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-[#8B3A3D] mt-0.5 shrink-0" />
                <span><strong>Admission sélective :</strong> Inscription via Campus Faso et sélection rigoureuse sur critères d&apos;excellence.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-[#8B3A3D] mt-0.5 shrink-0" />
                <span><strong>Pédagogie active :</strong> Projets réels, travaux pratiques en laboratoires spécialisés et stages en entreprise.</span>
              </li>
            </ul>
            <div className="pt-2">
              <Button asChild variant="outline" className="border-[#8B3A3D]/40 text-[#8B3A3D] dark:text-rose-300 hover:bg-[#8B3A3D]/10 font-semibold">
                <Link to="/a-propos" className="flex items-center gap-2">
                  Découvrir l&apos;histoire de l&apos;ESI <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl bg-gradient-to-br from-[#8B3A3D]/5 via-muted/40 to-[#C45C26]/5 p-6 border border-border">
            <h4 className="font-bold text-foreground text-lg flex items-center gap-2">
              <Info className="h-5 w-5 text-[#C45C26]" /> Informations & Contact Officiel
            </h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-[#8B3A3D] mt-0.5 shrink-0" />
                <span><strong>Campus de Nasso</strong>, Université Nazi Boni (UNB), Bobo-Dioulasso, Burkina Faso</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-[#8B3A3D] shrink-0" />
                <span><strong>Téléphone :</strong> (+226) 20 97 27 64</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-[#8B3A3D] shrink-0" />
                <span><strong>Email officiel :</strong> infoesi@univ-bobo.gov.bf</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border/80 flex flex-col sm:flex-row gap-3">
              <a
                href="https://www.campusfaso.bf"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-background border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
              >
                <span>Plateforme Campus Faso</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
              <a
                href="https://www.facebook.com/esi.unb.bf"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-background border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
              >
                <span>Page Facebook ESI-UNB</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── ESPACES DÉDIÉS BANNER ── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4A1D20] via-[#8B3A3D] to-[#C45C26] p-8 sm:p-12 text-white shadow-2xl">
          <div className="relative z-10 grid gap-8 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8 space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Accéder à vos espaces numériques
              </h2>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-xl">
                Étudiants, enseignants, bibliothécaires et administration : connectez-vous avec vos identifiants pour consulter vos cours, documents pédagogiques et outils de gestion.
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-3">
              <Button
                size="lg"
                asChild
                className="w-full bg-white text-[#8B3A3D] hover:bg-orange-50 font-bold shadow-lg transition-transform hover:scale-[1.02]"
              >
                <Link to="/login" className="flex items-center justify-center gap-2">
                  <LogIn className="h-4 w-4 text-[#8B3A3D]" /> Se connecter
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white font-semibold backdrop-blur"
              >
                <Link to="/inscription" className="flex items-center justify-center gap-2">
                  <UserPlus className="h-4 w-4" /> S&apos;inscrire
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}



