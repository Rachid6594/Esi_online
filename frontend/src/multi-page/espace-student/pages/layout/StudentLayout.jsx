import { Outlet, useNavigate, NavLink } from 'react-router-dom'
import { LayoutDashboard, LogOut, GraduationCap, BookOpen, FileText, Calendar, User, Bell, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getAuth, clearAuth, isAuthenticated } from '../../../../auth'
import { ThemeToggle } from '../../../../components/ThemeToggle'
import useNotifications from './hooks/useNotifications'

const navClass = ({ isActive }) =>
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ' +
  (isActive
    ? 'bg-[var(--color-esi-primary-light)] text-esi-primary dark:bg-esi-primary/20 dark:text-esi-primary'
    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-gray-700 dark:hover:text-white')

export default function StudentLayout() {
  const navigate = useNavigate()
  const auth = getAuth()
  const ok = isAuthenticated()
  const { unread } = useNotifications()
  const unreadCount = ok ? unread.length : 0
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => { if (!ok) navigate('/login', { replace: true }) }, [ok, navigate])

  /* Fermer le drawer mobile quand on change de route */
  useEffect(() => { setMobileOpen(false) }, [navigate])

  function handleLogout() { clearAuth(); navigate('/login', { replace: true }) }

  if (!ok) return null

  const userName = auth?.user?.first_name ? `${auth.user.first_name} ${auth.user.last_name || ''}`.trim() : auth?.user?.email?.split('@')[0] || 'Étudiant'

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-5 dark:border-gray-700">
        <div className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-esi-primary" strokeWidth={1.5} /><span className="truncate font-semibold text-slate-800 dark:text-slate-200"><span className="text-esi-primary">ESI</span> Étudiant</span></div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button onClick={() => setMobileOpen(false)} className="rounded p-1 text-slate-400 hover:bg-slate-200 md:hidden dark:hover:bg-gray-700"><X className="h-4 w-4" /></button>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        <NavLink to="/home" end className={navClass} onClick={() => setMobileOpen(false)}><LayoutDashboard className="h-5 w-5" strokeWidth={1.5} />Tableau de bord{unreadCount > 0 && <span className="ml-auto rounded-full bg-esi-primary px-1.5 py-0.5 text-[10px] font-bold text-white">{unreadCount}</span>}</NavLink>
        <div className="my-2 border-t border-slate-200 pt-2 dark:border-gray-700"><p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Espace</p></div>
        <NavLink to="/home/cours" className={navClass} onClick={() => setMobileOpen(false)}><BookOpen className="h-5 w-5" strokeWidth={1.5} />Cours</NavLink>
        <NavLink to="/home/documents" className={navClass} onClick={() => setMobileOpen(false)}><FileText className="h-5 w-5" strokeWidth={1.5} />Documents</NavLink>
        <NavLink to="/home/emploi-du-temps" className={navClass} onClick={() => setMobileOpen(false)}><Calendar className="h-5 w-5" strokeWidth={1.5} />Emploi du temps</NavLink>
        <NavLink to="/home/profil" className={navClass} onClick={() => setMobileOpen(false)}><User className="h-5 w-5" strokeWidth={1.5} />Mon profil</NavLink>
      </nav>
      <div className="border-t border-slate-200 p-3 dark:border-gray-700">
        {unreadCount > 0 && <div className="mb-2 flex items-center gap-2 rounded-lg bg-esi-primary/10 px-3 py-2 text-xs text-esi-primary"><Bell className="h-3.5 w-3.5" strokeWidth={1.5} /><span>{unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}</span></div>}
        <p className="mb-1 truncate px-3 text-xs text-slate-500 dark:text-slate-400" title={auth?.user?.email}>{userName}</p>
        <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-gray-700 dark:hover:text-white"><LogOut className="h-5 w-5" strokeWidth={1.5} />Déconnexion</button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 dark:bg-gray-900 dark:text-slate-200">
      {/* Bouton hamburger mobile */}
      <div className="fixed left-3 top-3 z-50 md:hidden">
        {!mobileOpen && (
          <button onClick={() => setMobileOpen(true)} className="rounded-lg bg-white p-2 shadow-md transition hover:bg-slate-50 dark:bg-gray-800 dark:hover:bg-gray-700">
            <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </button>
        )}
      </div>

      {/* Overlay mobile */}
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar mobile (drawer) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out md:hidden dark:border-gray-700 dark:bg-gray-800 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>

      {/* Sidebar desktop (sticky) */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 border-r border-slate-200 bg-white md:block dark:border-gray-700 dark:bg-gray-800">
        {sidebarContent}
      </aside>

      <main className="flex-1 pt-14 md:pt-0"><Outlet /></main>
    </div>
  )
}
