import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
      <FileQuestion className="mb-6 h-16 w-16 text-muted-foreground" strokeWidth={1.25} />
      <p className="text-sm font-medium tracking-widest text-muted-foreground">Erreur 404</p>
      <h1 className="mt-2 text-3xl font-semibold">Page introuvable</h1>
      <p className="mt-4 max-w-md text-center text-muted-foreground">
        L&apos;adresse demandée n&apos;existe pas ou a été déplacée. Vérifiez la saisie ou revenez à
        l&apos;accueil.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link to="/">Retour à l&apos;accueil</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/login">Connexion</Link>
        </Button>
      </div>
    </main>
  )
}
