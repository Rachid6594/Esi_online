import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom'
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
  { to: '/home/cours', label: 'Cours', icon: BookOpen },
  { to: '/home/documents', label: 'Documents', icon: FileText },
  { to: '/home/emploi-du-temps', label: 'Emploi du temps', icon: Calendar },
  { to: '/home/profil', label: 'Mon profil', icon: User },
]

function SidebarNav({ unreadCount, onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {NAV.map(({ to, end, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )
          }
        >
          <Icon className="h-5 w-5" strokeWidth={1.5} />
          <span className="flex-1">{label}</span>
          {to === '/home' && unreadCount > 0 && (
            <Badge className="px-1.5 py-0 text-[10px]">{unreadCount}</Badge>
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

  useEffect(() => {
    if (!ok) navigate('/login', { replace: true })
  }, [ok, navigate])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

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
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-4">
        <GraduationCap className="h-5 w-5" strokeWidth={1.5} />
        <span className="truncate font-semibold">ESI Étudiant</span>
      </div>
      <ScrollArea className="flex-1">
        <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Navigation
        </p>
        <SidebarNav unreadCount={unreadCount} onNavigate={() => setMobileOpen(false)} />
      </ScrollArea>
      <Separator />
      <div className="space-y-2 p-3">
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs">
            <Bell className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>
              {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue
              {unreadCount > 1 ? 's' : ''}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 px-1">
          <Avatar size="sm">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{userName}</p>
            <p className="truncate text-xs text-muted-foreground">{auth?.user?.email}</p>
          </div>
          <ThemeToggle />
        </div>
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" strokeWidth={1.5} />
          Déconnexion
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Top bar mobile */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 px-3 backdrop-blur md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Ouvrir le menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0" showCloseButton>
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation étudiant</SheetTitle>
            </SheetHeader>
            {sidebarBody}
          </SheetContent>
        </Sheet>
        <span className="font-semibold">ESI Étudiant</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar size="sm">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{userName}</span>
                <span className="text-xs text-muted-foreground">{auth?.user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/home/profil')}>
              <User className="h-4 w-4" /> Profil
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r bg-card md:block">
        {sidebarBody}
      </aside>

      <main className="flex-1 pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  )
}
