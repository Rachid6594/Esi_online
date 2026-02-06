import { useRef } from 'react'
import {
  GraduationCap,
  BookOpen,
  FileText,
  Info,
  Users,
  LogIn,
} from 'lucide-react'

const SECTION_IDS = {
  accueil: 'accueil',
  vieEstudiantine: 'vie-estudiantine',
  documents: 'documents',
  aPropos: 'a-propos',
  enseignants: 'enseignants',
  login: 'login',
}

function scrollToSection(ref) {
  ref?.current?.scrollIntoView({ behavior: 'smooth' })
}

function SectionCard({ icon: Icon, title, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="mb-4 inline-flex rounded-xl bg-[var(--color-esi-orange-light)] p-3 text-[var(--color-esi-orange)]">
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <h3 className="mb-2 font-semibold text-slate-800">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  )
}

export default function LandingPage() {
  const accueilRef = useRef(null)
  const vieRef = useRef(null)
  const docsRef = useRef(null)
  const aProposRef = useRef(null)
  const enseignantsRef = useRef(null)
  const loginRef = useRef(null)

  const go = (ref) => (e) => {
    e.preventDefault()
    scrollToSection(ref)
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <a href="#accueil" onClick={go(accueilRef)} className="flex items-center gap-2 font-semibold text-slate-800">
            <span className="text-[var(--color-esi-primary)]">ESI</span> Online
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#vie-estudiantine" onClick={go(vieRef)} className="text-slate-600 hover:text-[var(--color-esi-primary)]">Vie estudiantine</a>
            <a href="#documents" onClick={go(docsRef)} className="text-slate-600 hover:text-[var(--color-esi-primary)]">Documents</a>
            <a href="#a-propos" onClick={go(aProposRef)} className="text-slate-600 hover:text-[var(--color-esi-primary)]">À propos</a>
            <a href="#enseignants" onClick={go(enseignantsRef)} className="text-slate-600 hover:text-[var(--color-esi-primary)]">Enseignants</a>
            <a href="#login" onClick={go(loginRef)} className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-esi-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-esi-primary-hover)]">
              <LogIn className="h-4 w-4" /> Connexion
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section ref={accueilRef} id={SECTION_IDS.accueil} className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Bienvenue sur <span className="text-[var(--color-esi-primary)]">ESI Online</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              La plateforme numérique de l&apos;École Supérieure d&apos;Informatique. Accédez aux ressources, à la vie estudiantine et à vos espaces en un clic.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#login"
                onClick={go(loginRef)}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-esi-primary)] px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-esi-primary-hover)]"
              >
                <LogIn className="h-4 w-4" /> Se connecter
              </a>
              <a
                href="#documents"
                onClick={go(docsRef)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <BookOpen className="h-4 w-4" /> Documents
              </a>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[var(--color-esi-orange-light)]/40 to-transparent" aria-hidden />
      </section>

      {/* Sections en grille */}
      <section ref={vieRef} id={SECTION_IDS.vieEstudiantine} className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-10 text-2xl font-semibold text-slate-900">Vie estudiantine</h2>
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
        </div>
      </section>

      <section ref={docsRef} id={SECTION_IDS.documents} className="border-t border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-10 text-2xl font-semibold text-slate-900">Documents</h2>
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
        </div>
      </section>

      <section ref={aProposRef} id={SECTION_IDS.aPropos} className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-6 text-2xl font-semibold text-slate-900">À propos</h2>
          <p className="max-w-2xl text-slate-600">
            L&apos;École Supérieure d&apos;Informatique forme les acteurs du numérique. Présentation de l&apos;établissement, de son histoire et de ses formations.
          </p>
        </div>
      </section>

      <section ref={enseignantsRef} id={SECTION_IDS.enseignants} className="border-t border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-6 text-2xl font-semibold text-slate-900">Enseignants</h2>
          <p className="max-w-2xl text-slate-600">
            Découvrez l&apos;équipe pédagogique et les enseignants de l&apos;ESI. Coordonnées et domaines d&apos;enseignement.
          </p>
        </div>
      </section>

      {/* CTA Connexion */}
      <section ref={loginRef} id={SECTION_IDS.login} className="border-t border-slate-200 bg-slate-100 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-semibold text-slate-900">Accéder à votre espace</h2>
          <p className="mx-auto mt-2 max-w-md text-slate-600">
            Étudiants, enseignants ou administration : connectez-vous pour accéder à vos ressources.
          </p>
          <div className="mt-8 flex justify-center">
            <a
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-esi-primary)] px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-esi-primary-hover)]"
            >
              <LogIn className="h-4 w-4" /> Se connecter
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-800 py-10 text-white">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <p className="text-slate-300">© ESI Online — École Supérieure d&apos;Informatique</p>
          <a href="/login" className="mt-2 inline-block text-sm text-slate-400 hover:text-white">Connexion / Espace admin</a>
        </div>
      </footer>
    </div>
  )
}
