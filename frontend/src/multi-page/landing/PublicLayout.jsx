import { Link, useLocation, Outlet } from 'react-router-dom'
import { LogIn, GraduationCap, Menu, Sparkles } from 'lucide-react'
import { ThemeToggle } from '../../components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const LINKS = [
  { to: '/vie-estudiantine', label: 'Vie estudiantine' },
  { to: '/documents', label: 'Documents' },
  { to: '/a-propos', label: 'À propos' },
  { to: '/enseignants', label: 'Enseignants' },
]

function Brand() {
  return (
    <Link to="/" className="group flex items-center gap-2.5 font-bold transition-transform hover:scale-[1.02]">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B3A3D] to-[#C45C26] text-white shadow-md shadow-[#8B3A3D]/20 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#C45C26]/30">
        <GraduationCap className="h-5 w-5" />
      </span>
      <div className="flex flex-col">
        <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-[#8B3A3D] via-[#A8483B] to-[#C45C26] bg-clip-text text-transparent dark:from-[#F0E4E4] dark:to-[#F5E6DF]">
          ESI Online
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground -mt-1 hidden sm:block">
          École Supérieure d'Informatique
        </span>
      </div>
    </Link>
  )
}

export default function PublicLayout() {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80 transition-all">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Brand />

          <nav className="hidden md:flex items-center gap-1">
            {LINKS.map(({ to, label }) => {
              const active = pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                    active
                      ? 'text-[#8B3A3D] dark:text-rose-300 font-semibold bg-[#8B3A3D]/10 dark:bg-[#8B3A3D]/25'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )}
                >
                  {label}
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-[#8B3A3D] to-[#C45C26] rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden md:inline-flex border-[#C45C26]/40 text-[#C45C26] dark:text-orange-400 hover:bg-[#C45C26]/10 hover:text-[#A34D1F] hover:border-[#C45C26] font-medium"
            >
              <Link to="/inscription">S&apos;inscrire</Link>
            </Button>
            
            <Button
              size="sm"
              asChild
              className="hidden md:inline-flex bg-gradient-to-r from-[#8B3A3D] to-[#C45C26] hover:from-[#722F31] hover:to-[#A34D1F] text-white shadow-md shadow-[#8B3A3D]/25 hover:shadow-lg hover:shadow-[#C45C26]/30 transition-all duration-200"
            >
              <Link to="/login" className="flex items-center gap-1.5 font-medium">
                <LogIn className="h-4 w-4" /> Connexion
              </Link>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden border-border hover:bg-[#8B3A3D]/10" aria-label="Menu">
                  <Menu className="h-5 w-5 text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0 flex flex-col justify-between">
                <div>
                  <SheetHeader className="border-b p-5 text-left bg-gradient-to-r from-[#8B3A3D]/10 to-[#C45C26]/10">
                    <Brand />
                  </SheetHeader>
                  <nav className="flex flex-col gap-1.5 p-4">
                    {LINKS.map(({ to, label }) => {
                      const active = pathname === to
                      return (
                        <SheetClose asChild key={to}>
                          <Button
                            variant="ghost"
                            className={cn(
                              'justify-start font-medium text-sm h-10',
                              active
                                ? 'bg-[#8B3A3D]/10 text-[#8B3A3D] dark:text-rose-300 font-bold border-l-4 border-[#8B3A3D]'
                                : 'text-muted-foreground hover:text-foreground'
                            )}
                            asChild
                          >
                            <Link to={to}>{label}</Link>
                          </Button>
                        </SheetClose>
                      )
                    })}
                  </nav>
                </div>

                <div className="p-4 border-t space-y-2 bg-muted/30">
                  <SheetClose asChild>
                    <Button variant="outline" className="w-full justify-center border-[#C45C26]/50 text-[#C45C26]" asChild>
                      <Link to="/inscription">S&apos;inscrire</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button className="w-full justify-center bg-gradient-to-r from-[#8B3A3D] to-[#C45C26] text-white" asChild>
                      <Link to="/login" className="flex items-center gap-1.5">
                        <LogIn className="h-4 w-4" /> Connexion
                      </Link>
                    </Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-[#8B3A3D]/30 bg-gradient-to-b from-[#4A1D20] to-[#2E1012] text-white py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white border border-white/20">
                  <GraduationCap className="h-4 w-4" />
                </span>
                <span className="font-bold text-lg text-white">ESI Online</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                École Supérieure d'Informatique — Université Nazi Boni (UNB). Établissement public de référence fondé en 1991 à Bobo-Dioulasso, Burkina Faso.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-orange-300 mb-3">Navigation</h4>
              <ul className="space-y-2 text-xs text-white/70">
                <li><Link to="/documents" className="hover:text-white transition">Bibliothèque numérique</Link></li>
                <li><Link to="/a-propos" className="hover:text-white transition">À propos de l'ESI</Link></li>
                <li><Link to="/enseignants" className="hover:text-white transition">Filières & Pédagogie</Link></li>
                <li><Link to="/vie-estudiantine" className="hover:text-white transition">Vie estudiantine</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-orange-300 mb-3">Espaces Numériques</h4>
              <ul className="space-y-2 text-xs text-white/70">
                <li><Link to="/login" className="hover:text-white transition">Espace Étudiant</Link></li>
                <li><Link to="/login" className="hover:text-white transition">Espace Enseignant</Link></li>
                <li><Link to="/login" className="hover:text-white transition">Espace Bibliothèque</Link></li>
                <li><Link to="/login" className="hover:text-white transition">Administration ESI</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-orange-300 mb-3">Contact Officiel</h4>
              <div className="space-y-2 text-xs text-white/70">
                <p><span className="text-white font-medium">Campus :</span> Nasso, Bobo-Dioulasso</p>
                <p><span className="text-white font-medium">Tél :</span> (+226) 20 97 27 64</p>
                <p><span className="text-white font-medium">Email :</span> infoesi@univ-bobo.gov.bf</p>
                <div className="pt-2">
                  <a
                    href="https://www.campusfaso.bf"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-[11px] text-orange-300 hover:text-white underline transition"
                  >
                    Orientation sur Campus Faso →
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
            <p>© {new Date().getFullYear()} ESI — Université Nazi Boni (UNB). Tous droits réservés.</p>
            <div className="flex gap-4">
              <Link to="/a-propos" className="hover:text-white transition">Historique & Statut</Link>
              <Link to="/a-propos" className="hover:text-white transition">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

