import { Link } from 'react-router-dom'

export default function AProposPage() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="mb-6 text-3xl font-semibold text-slate-900 dark:text-white">À propos</h1>
        <p className="max-w-2xl text-slate-600 dark:text-slate-300">
            L&apos;École Supérieure d&apos;Informatique forme les acteurs du numérique. Présentation de
            l&apos;établissement, de son histoire et de ses formations.
          </p>
          <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
            Fondée pour répondre aux besoins du marché en compétences informatiques, l&apos;ESI dispense des
            formations reconnues et accompagne ses étudiants jusqu&apos;à l&apos;insertion professionnelle.
          </p>
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
