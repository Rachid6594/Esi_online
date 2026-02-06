import { Outlet, useNavigate, NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  LogOut,
  GraduationCap,
  BookOpen,
  FileText,
  Calendar,
  User,
} from 'lucide-react'
import { useEffect } from 'react'
import { getAuth, clearAuth, isAuthenticated } from '../../auth'

const navClass = ({ isActive }) =>
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ' +
  (isActive
    ? 'bg-[var(--color-esi-primary-light)] text-[var(--color-esi-primary)]'
    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')

export default function StudentLayout() {
  const navigate = useNavigate()
  const auth = getAuth()
  const ok = isAuthenticated()

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

  const userName = auth?.user?.email?.split('@')[0] || auth?.user?.first_name || 'Étudiant'

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-5">
          <span className="font-semibold text-slate-800">
            <span className="text-[var(--color-esi-primary)]">ESI</span> Étudiant
          </span>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          <NavLink to="/home" end className={navClass}>
            <LayoutDashboard className="h-5 w-5" strokeWidth={1.5} />
            Tableau de bord
          </NavLink>
          <div className="my-2 border-t border-slate-200 pt-2">
            <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Espace
            </p>
          </div>
          <NavLink to="/home/cours" className={navClass}>
            <BookOpen className="h-5 w-5" strokeWidth={1.5} />
            Cours
          </NavLink>
          <NavLink to="/home/documents" className={navClass}>
            <FileText className="h-5 w-5" strokeWidth={1.5} />
            Documents
          </NavLink>
          <NavLink to="/home/emploi-du-temps" className={navClass}>
            <Calendar className="h-5 w-5" strokeWidth={1.5} />
            Emploi du temps
          </NavLink>
          <NavLink to="/home/profil" className={navClass}>
            <User className="h-5 w-5" strokeWidth={1.5} />
            Mon profil
          </NavLink>
        </nav>
        <div className="border-t border-slate-200 p-3">
          <p className="mb-1 truncate px-3 text-xs text-slate-500" title={auth?.user?.email}>
            {userName}
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut className="h-5 w-5" strokeWidth={1.5} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
