import { Link } from 'react-router-dom'

export default function AProposPage() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="mb-6 text-3xl font-semibold text-foreground">� propos</h1>
        <p className="max-w-2xl text-muted-foreground">
            L&apos;�cole Sup�rieure d&apos;Informatique forme les acteurs du num�rique. Pr�sentation de
            l&apos;�tablissement, de son histoire et de ses formations.
          </p>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Fond�e pour r�pondre aux besoins du march� en comp�tences informatiques, l&apos;ESI dispense des
            formations reconnues et accompagne ses �tudiants jusqu&apos;� l&apos;insertion professionnelle.
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
