import { Link } from 'react-router-dom'
import { GraduationCap, BookOpen, Info, Users, LogIn, ChevronRight } from 'lucide-react'

const pages = [
  { to: '/vie-estudiantine', icon: GraduationCap, title: 'Vie estudiantine', description: 'Activités, communauté et infos pratiques.' },
  { to: '/documents', icon: BookOpen, title: 'Documents', description: 'Bibliothèque en ligne et documents officiels.' },
  { to: '/a-propos', icon: Info, title: 'À propos', description: "Présentation de l'établissement et des formations." },
  { to: '/enseignants', icon: Users, title: 'Enseignants', description: "L'équipe pédagogique et les domaines d'enseignement." },
]

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              Bienvenue sur <span className="text-[var(--color-esi-primary)]">ESI Online</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              La plateforme numérique de l&apos;École Supérieure d&apos;Informatique. Accédez aux ressources,
              à la vie estudiantine et à vos espaces en un clic.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-esi-primary)] px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-esi-primary-hover)]"
              >
                <LogIn className="h-4 w-4" /> Se connecter
              </Link>
              <Link
                to="/documents"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-gray-600 dark:bg-gray-700 dark:text-slate-200 dark:hover:bg-gray-600"
              >
                <BookOpen className="h-4 w-4" /> Documents
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[var(--color-esi-orange-light)]/40 to-transparent dark:from-gray-700/30" aria-hidden />
      </section>

      {/* Liens vers les pages */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-10 text-2xl font-semibold text-slate-900 dark:text-white">Découvrir</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pages.map(({ to, icon: Icon, title, description }) => (
              <Link
                key={to}
                to={to}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500"
              >
                <div className="mb-4 inline-flex rounded-xl bg-[var(--color-esi-orange-light)] p-3 text-[var(--color-esi-orange)] dark:bg-gray-700 dark:text-esi-orange">
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="mb-2 font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
                <p className="mb-4 flex-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-esi-primary)]">
                  Voir la page <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Connexion */}
      <section className="border-t border-slate-200 bg-slate-100 py-16 sm:py-20 dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Accéder à votre espace</h2>
          <p className="mx-auto mt-2 max-w-md text-slate-600 dark:text-slate-300">
            Étudiants, enseignants ou administration : connectez-vous pour accéder à vos ressources.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-esi-primary)] px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-esi-primary-hover)]"
            >
              <LogIn className="h-4 w-4" /> Se connecter
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
