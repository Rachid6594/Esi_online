import { Link } from 'react-router-dom'

export default function EnseignantsPage() {
  return (
    <section className="border-t border-slate-200 bg-white py-16 sm:py-20 dark:border-gray-700 dark:bg-gray-800/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="mb-6 text-3xl font-semibold text-slate-900 dark:text-white">Enseignants</h1>
        <p className="max-w-2xl text-slate-600 dark:text-slate-300">
          Découvrez l&apos;équipe pédagogique et les enseignants de l&apos;ESI. Coordonnées et domaines
          d&apos;enseignement.
        </p>
        <p className="mt-6 max-w-2xl text-slate-600 dark:text-slate-300">
          La liste des enseignants et leurs spécialités sera disponible prochainement sur cette page.
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
