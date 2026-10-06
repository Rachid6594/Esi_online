import { Outlet, useNavigate, NavLink, useLocation, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  LogOut,
  GraduationCap,
  BookOpen,
  FileText,
  Calendar,
  User,
  Bell,
  Menu,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { getAuth, clearAuth, isAuthenticated } from '../../../../auth'
import { ThemeToggle } from '../../../../components/ThemeToggle'
import useNotifications from './hooks/useNotifications'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/home', end: true, label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/home/cours', label: 'Mes Cours', icon: BookOpen },
  { to: '/home/documents', label: 'Documents & Ressources', icon: FileText },
  { to: '/home/emploi-du-temps', label: 'Emploi du temps', icon: Calendar },
  { to: '/home/profil', label: 'Mon profil', icon: User },
]

function SidebarNav({ unreadCount, onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col gap-1.5 p-3">
      {NAV.map(({ to, end, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-gradient-to-r from-[#8B3A3D]/15 to-[#C45C26]/10 text-[#8B3A3D] font-bold border-l-4 border-[#8B3A3D] shadow-xs dark:from-[#8B3A3D]/30 dark:to-[#C45C26]/20 dark:text-rose-300 dark:border-rose-400'
                : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground hover:translate-x-0.5'
            )
          }
        >
          <Icon className="h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-110" strokeWidth={1.75} />
          <span className="flex-1 truncate">{label}</span>
          {to === '/home' && unreadCount > 0 && (
            <Badge className="px-1.5 py-0.2 text-[10px] bg-[#C45C26] text-white border-0 font-bold shadow-xs">
              {unreadCount}
            </Badge>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export default function StudentLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const auth = getAuth()
  const ok = isAuthenticated()
  const { unread } = useNotifications()
  const unreadCount = ok ? unread.length : 0
  const [mobileOpen, setMobileOpen] = useState(false)

  const [lastPath, setLastPath] = useState(location.pathname)
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname)
    setMobileOpen(false)
  }

  useEffect(() => {
    if (!ok) navigate('/login', { replace: true })
  }, [ok, navigate])

  function handleLogout() {
    clearAuth()
    navigate('/login', { replace: true })
  }

  if (!ok) return null

  const userName = auth?.user?.first_name
    ? `${auth.user.first_name} ${auth.user.last_name || ''}`.trim()
    : auth?.user?.email?.split('@')[0] || 'Étudiant'
  const initials = userName
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const sidebarBody = (
    <div className="flex h-full flex-col bg-card">
      {/* Brand Header */}
      <div className="flex items-center gap-3 border-b border-border/80 px-4 py-4 bg-gradient-to-r from-[#8B3A3D]/8 to-[#C45C26]/8">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B3A3D] to-[#C45C26] text-white shadow-md shadow-[#8B3A3D]/25">
          <GraduationCap className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <span className="block truncate font-extrabold text-sm text-foreground">
            ESI Étudiant
          </span>
          <span className="block truncate text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Espace Numérique
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <p className="px-4 pt-4 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Navigation Principale
        </p>
        <SidebarNav unreadCount={unreadCount} onNavigate={() => setMobileOpen(false)} />
      </ScrollArea>

      <Separator />

      {/* User footer profile strip */}
      <div className="space-y-2 p-3 bg-muted/20">
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-[#C45C26]/10 border border-[#C45C26]/20 px-3 py-2 text-xs font-semibold text-[#C45C26] dark:text-orange-300">
            <Bell className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <span className="truncate">
              {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-background/80 p-2 shadow-xs">
          <Avatar className="h-8 w-8 shrink-0 border border-[#8B3A3D]/30 bg-[#8B3A3D]/10 text-[#8B3A3D] font-bold">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-foreground">{userName}</p>
            <p className="truncate text-[10px] text-muted-foreground">{auth?.user?.email}</p>
          </div>
          <ThemeToggle />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 transition"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          Déconnexion
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased">
      {/* Top bar mobile */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border/80 bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden shadow-xs">
        <div className="flex items-center gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Ouvrir le menu" className="h-9 w-9 rounded-lg">
                <Menu className="h-5 w-5 text-foreground" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0" showCloseButton>
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation étudiant</SheetTitle>
              </SheetHeader>
              {sidebarBody}
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#8B3A3D] to-[#C45C26] text-white">
              <GraduationCap className="h-4 w-4" />
            </span>
            <span className="font-extrabold text-sm text-foreground">ESI Étudiant</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8 border border-[#8B3A3D]/30 bg-[#8B3A3D]/10 text-[#8B3A3D] text-xs font-bold">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-foreground">{userName}</span>
                  <span className="text-xs text-muted-foreground truncate">{auth?.user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/home/profil')} className="cursor-pointer">
                <User className="h-4 w-4 mr-2 text-[#8B3A3D]" /> Mon profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/documents')} className="cursor-pointer">
                <FileText className="h-4 w-4 mr-2 text-[#C45C26]" /> Bibliothèque ESI
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleLogout} className="cursor-pointer text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40">
                <LogOut className="h-4 w-4 mr-2" /> Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/80 bg-card md:block">
        {sidebarBody}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0 pt-14 md:pt-0 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  )
}

