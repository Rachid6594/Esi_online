import { Outlet, useNavigate, NavLink } from 'react-router-dom'
import { LayoutDashboard, LogOut } from 'lucide-react'
import { useEffect } from 'react'
import { getAuth, clearAuth, isProfesseur } from '../../auth'
import { ThemeToggle } from '../../components/ThemeToggle'
import { useSidebarState, SidebarCloseButton, SidebarOpenButton } from '../../components/SidebarToggle'

const navClass = ({ isActive }) =>
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ' +
  (isActive
    ? 'bg-[var(--color-esi-primary-light)] text-[var(--color-esi-primary)] dark:bg-esi-primary/20 dark:text-esi-primary'
    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-gray-700 dark:hover:text-white')

export default function ProfesseurLayout() {
  const navigate = useNavigate()
  const auth = getAuth()
  const ok = isProfesseur()

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

  const userName = auth?.user?.first_name || auth?.user?.email?.split('@')[0] || 'Professeur'
  const [sidebarOpen, toggleSidebar] = useSidebarState()

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 dark:bg-gray-900 dark:text-slate-200">
      {!sidebarOpen && (
        <div className="fixed left-4 top-4 z-40">
          <SidebarOpenButton onClick={toggleSidebar} className="bg-white shadow-md dark:bg-gray-800" />
        </div>
      )}
      <aside
        className={`flex shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 dark:border-gray-700 dark:bg-gray-800 ${
          sidebarOpen ? 'w-56' : 'w-0 overflow-hidden border-r-0'
        }`}
      >
        <div className="flex w-56 min-w-56 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-5 dark:border-gray-700">
            <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
              <span className="text-[var(--color-esi-primary)]">ESI</span> Professeur
            </span>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <SidebarCloseButton onClick={toggleSidebar} />
            </div>
          </div>
          <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
            <NavLink to="/prof" end className={navClass}>
              <LayoutDashboard className="h-5 w-5" strokeWidth={1.5} />
              Tableau de bord
            </NavLink>
          </nav>
          <div className="border-t border-slate-200 p-3 dark:border-gray-700">
            <p className="mb-1 truncate px-3 text-xs text-slate-500 dark:text-slate-400" title={auth?.user?.email}>
              {userName}
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <LogOut className="h-5 w-5" strokeWidth={1.5} />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
