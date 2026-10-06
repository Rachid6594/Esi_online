import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, LogOut, GraduationCap, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getAuth, clearAuth, isProfesseur } from '../../auth'
import { ThemeToggle } from '../../components/ThemeToggle'

const navClass = ({ isActive }) =>
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ' +
  (isActive
    ? 'bg-[var(--color-esi-primary-light)] text-[var(--color-esi-primary)] font-semibold shadow-xs dark:bg-[var(--color-esi-primary)]/20 dark:text-[var(--color-esi-primary)] nav-active-glow'
    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-gray-700 dark:hover:text-white')

export default function ProfesseurLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const auth = getAuth()
  const ok = isProfesseur()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [lastPath, setLastPath] = useState(location.pathname)

  if (lastPath !== location.pathname) {
    setLastPath(location.pathname)
    setMobileOpen(false)
  }

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

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-4 py-4 dark:border-gray-700" style={{ background: 'linear-gradient(135deg, var(--color-esi-primary-light) 0%, #fff 100%)' }}>
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-md" style={{ background: 'linear-gradient(135deg, var(--color-esi-primary), #6B2D30)' }}>
            <GraduationCap className="h-4 w-4" />
          </span>
          <span className="truncate font-bold text-slate-800 dark:text-slate-200">
            <span style={{ color: 'var(--color-esi-primary)' }}>ESI</span>{' '}Professeur
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 md:hidden dark:hover:bg-gray-700"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <NavLink to="/prof" end className={navClass} onClick={() => setMobileOpen(false)}>
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
  )

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 dark:bg-gray-900 dark:text-slate-200">
      {/* Bouton hamburger mobile */}
      <div className="fixed left-3 top-3 z-40 md:hidden">
        {!mobileOpen && (
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-md ring-1 ring-slate-900/5 transition hover:bg-slate-50 dark:bg-gray-800 dark:text-slate-200 dark:hover:bg-gray-700"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar mobile (tiroir) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden dark:border-gray-700 dark:bg-gray-800 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar desktop (sticky) */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col dark:border-gray-700 dark:bg-gray-800">
        {sidebarContent}
      </aside>

      {/* Zone de contenu principal */}
      <main className="flex-1 min-w-0 pt-12 md:pt-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

