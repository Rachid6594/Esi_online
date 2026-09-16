import { Link } from 'react-router-dom'
import { GraduationCap, BookOpen, Info, Users, LogIn, UserPlus, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const pages = [
  { to: '/vie-estudiantine', icon: GraduationCap, title: 'Vie estudiantine', description: 'Activités, communauté et infos pratiques.' },
  { to: '/documents', icon: BookOpen, title: 'Documents', description: 'Bibliothèque en ligne et documents officiels.' },
  { to: '/a-propos', icon: Info, title: 'À propos', description: "Présentation de l'établissement et des formations." },
  { to: '/enseignants', icon: Users, title: 'Enseignants', description: "L'équipe pédagogique et les domaines d'enseignement." },
]

export default function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Bienvenue sur ESI Online
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              La plateforme numérique de l&apos;École Supérieure d&apos;Informatique. Accédez aux ressources,
              à la vie estudiantine et à vos espaces en un clic.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/inscription">
                  <UserPlus className="h-4 w-4" /> S&apos;inscrire
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/login">
                  <LogIn className="h-4 w-4" /> Se connecter
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-muted to-transparent" aria-hidden />
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-10 text-2xl font-semibold text-foreground">Découvrir</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pages.map(({ to, icon: Icon, title, description }) => (
              <Link key={to} to={to}>
                <Card className="h-full shadow-sm transition hover:border-border hover:shadow-md">
                  <CardHeader>
                    <div className="mb-2 inline-flex rounded-xl bg-muted p-3 text-foreground">
                      <Icon className="h-6 w-6" strokeWidth={1.5} />
                    </div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="flex-1">{description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
                      Voir la page <ChevronRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-semibold text-foreground">Accéder à votre espace</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Étudiants, enseignants ou administration : connectez-vous pour accéder à vos ressources.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/inscription">
                <UserPlus className="h-4 w-4" /> S&apos;inscrire
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/login">
                <LogIn className="h-4 w-4" /> Se connecter
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
