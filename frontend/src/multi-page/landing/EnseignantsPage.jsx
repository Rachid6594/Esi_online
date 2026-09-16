import { Link } from 'react-router-dom'

export default function EnseignantsPage() {
  return (
    <section className="border-t border-border bg-card py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="mb-6 text-3xl font-semibold text-foreground">Enseignants</h1>
        <p className="max-w-2xl text-muted-foreground">
          D�couvrez l&apos;�quipe p�dagogique et les enseignants de l&apos;ESI. Coordonn�es et domaines
          d&apos;enseignement.
        </p>
        <p className="mt-6 max-w-2xl text-muted-foreground">
          La liste des enseignants et leurs sp�cialit�s sera disponible prochainement sur cette page.
        </p>
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
