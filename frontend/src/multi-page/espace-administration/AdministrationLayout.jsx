import { Outlet, useNavigate, NavLink } from 'react-router-dom'
import { LayoutDashboard, LogOut, UserCircle } from 'lucide-react'
import { useEffect } from 'react'
import { getAuth, clearAuth, isAdministrationEcole } from '../../auth'
import { ThemeToggle } from '../../components/ThemeToggle'
import { useSidebarState, SidebarCloseButton, SidebarOpenButton } from '../../components/SidebarToggle'
import { Button } from '@/components/ui/button'

const navClass = ({ isActive }) =>
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ' +
  (isActive
    ? 'bg-muted text-foreground'
    : 'text-muted-foreground hover:bg-muted hover:text-foreground')

export default function AdministrationLayout() {
  const navigate = useNavigate()
  const auth = getAuth()
  const ok = isAdministrationEcole()

  useEffect(() => {
    if (!ok) {
      navigate('/login', { replace: true })
    }
  }, [ok, navigate])

  function handleLogout() {
    clearAuth()
    navigate('/login', { replace: true })
  }

  if (!ok) {
    return null
  }

  const user = auth?.user
  const poste = user?.poste

  const [sidebarOpen, toggleSidebar] = useSidebarState()

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      {!sidebarOpen && (
        <div className="fixed left-4 top-4 z-40">
          <SidebarOpenButton onClick={toggleSidebar} className="bg-card shadow-md" />
        </div>
      )}
      <aside
        className={`flex shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 ${
          sidebarOpen ? 'w-56' : 'w-0 overflow-hidden border-r-0'
        }`}
      >
        <div className="flex w-56 min-w-56 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-5">
            <span className="truncate font-semibold text-foreground">
              ESI Administration
            </span>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <SidebarCloseButton onClick={toggleSidebar} />
            </div>
          </div>
          <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
            <NavLink to="/administration" end className={navClass}>
              <LayoutDashboard className="h-5 w-5" strokeWidth={1.5} />
              Tableau de bord
            </NavLink>
          </nav>
          <div className="border-t border-border p-3">
            <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground">
              <UserCircle className="h-9 w-9 shrink-0 text-muted-foreground dark:text-muted-foreground" strokeWidth={1.5} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {user?.email || user?.username || 'Administration'}
                </p>
                {poste && (
                  <p className="truncate text-xs text-muted-foreground">{poste}</p>
                )}
              </div>
            </div>
            <Button type="button" variant="ghost" onClick={handleLogout} className="w-full justify-start gap-3 px-3 py-2.5">
              <LogOut className="h-5 w-5" strokeWidth={1.5} />
              D�connexion
            </Button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
