import { Link, useLocation, Outlet } from 'react-router-dom'
import { LogIn, GraduationCap, Menu } from 'lucide-react'
import { ThemeToggle } from '../../components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
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
    <Link to="/" className="flex items-center gap-2 font-semibold">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <GraduationCap className="h-5 w-5" />
      </span>
      <span>ESI Online</span>
    </Link>
  )
}

export default function PublicLayout() {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Brand />

          <NavigationMenu className="hidden md:flex" viewport={false}>
            <NavigationMenuList>
              {LINKS.map(({ to, label }) => (
                <NavigationMenuItem key={to}>
                  <NavigationMenuLink
                    asChild
                    active={pathname === to}
                    className={cn(navigationMenuTriggerStyle(), 'bg-transparent')}
                  >
                    <Link to={to}>{label}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
              <Link to="/inscription">S&apos;inscrire</Link>
            </Button>
            <Button size="sm" asChild className="hidden md:inline-flex">
              <Link to="/login">
                <LogIn className="h-4 w-4" /> Connexion
              </Link>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0">
                <SheetHeader className="border-b p-4 text-left">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 p-3">
                  {LINKS.map(({ to, label }) => (
                    <SheetClose asChild key={to}>
                      <Button
                        variant={pathname === to ? 'secondary' : 'ghost'}
                        className="justify-start"
                        asChild
                      >
                        <Link to={to}>{label}</Link>
                      </Button>
                    </SheetClose>
                  ))}
                  <Separator className="my-2" />
                  <SheetClose asChild>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link to="/inscription">S&apos;inscrire</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button className="justify-start" asChild>
                      <Link to="/login">
                        <LogIn className="h-4 w-4" /> Connexion
                      </Link>
                    </Button>
                  </SheetClose>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t bg-primary py-10 text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <p className="text-primary-foreground/80">© ESI Online — École Supérieure d&apos;Informatique</p>
          <Button variant="link" asChild className="mt-2 text-primary-foreground/70 hover:text-primary-foreground">
            <Link to="/login">Connexion / Espace admin</Link>
          </Button>
        </div>
      </footer>
    </div>
  )
}
