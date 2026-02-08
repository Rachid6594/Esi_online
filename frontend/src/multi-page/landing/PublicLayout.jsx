import { Link, NavLink, Outlet } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { ThemeToggle } from '../../components/ThemeToggle'

const navLinkClass = ({ isActive }) =>
  'text-slate-600 hover:text-[var(--color-esi-primary)] dark:text-slate-300 dark:hover:text-white ' +
  (isActive ? 'font-medium text-[var(--color-esi-primary)] dark:text-white' : '')

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 dark:bg-gray-900 dark:text-slate-200">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
            <span className="text-[var(--color-esi-primary)]">ESI</span> Online
          </Link>
          <nav className="flex items-center gap-4 md:gap-8">
            <div className="hidden md:flex md:items-center md:gap-8">
              <NavLink to="/vie-estudiantine" className={navLinkClass}>
                Vie estudiantine
              </NavLink>
              <NavLink to="/documents" className={navLinkClass}>
                Documents
              </NavLink>
              <NavLink to="/a-propos" className={navLinkClass}>
                À propos
              </NavLink>
              <NavLink to="/enseignants" className={navLinkClass}>
                Enseignants
              </NavLink>
            </div>
            <ThemeToggle />
            <Link
              to="/login"
              className="hidden md:inline-flex items-center gap-2 rounded-lg bg-[var(--color-esi-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-esi-primary-hover)]"
            >
              <LogIn className="h-4 w-4" /> Connexion
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-slate-800 py-10 text-white dark:border-gray-700 dark:bg-gray-950">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <p className="text-slate-300">© ESI Online — École Supérieure d&apos;Informatique</p>
          <Link to="/login" className="mt-2 inline-block text-sm text-slate-400 hover:text-white">
            Connexion / Espace admin
          </Link>
        </div>
      </footer>
    </div>
  )
}
