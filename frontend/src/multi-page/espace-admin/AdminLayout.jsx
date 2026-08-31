import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  LogOut,
  GraduationCap,
  BookMarked,
  Building2,
  Settings,
  School,
  ChevronDown,
  ChevronRight,
  Calendar,
  Layers,
  BookOpen,
  Users,
  BookMarked as BookMarkedIcon,
  List,
  UserCircle,
  Menu,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { getAuth, clearAuth, isAdmin } from '../../auth'
import { ThemeToggle } from '../../components/ThemeToggle'
import { useSidebarState, SidebarCloseButton, SidebarOpenButton } from '../../components/SidebarToggle'

const navClass = ({ isActive }) =>
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ' +
  (isActive
    ? 'bg-[var(--color-esi-primary-light)] text-[var(--color-esi-primary)] dark:bg-esi-primary/20 dark:text-esi-primary'
    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-gray-700 dark:hover:text-white')

const etablissementSections = [
  { key: 'annees', label: 'Années académiques', icon: Calendar },
  { key: 'niveaux', label: 'Niveaux', icon: Layers },
  { key: 'filieres', label: 'Filières', icon: BookOpen },
  { key: 'classes', label: 'Classes', icon: GraduationCap },
  { key: 'matieres', label: 'Matières', icon: BookMarkedIcon },
  { key: 'adminEcoles', label: 'Administration École', icon: Users },
]

const etudiantsSections = [
  { key: 'dashboard', label: 'Liste des étudiants', icon: List },
]

const bibliothecairesSections = [
  { key: 'liste', label: 'Liste', icon: List },
]

const professeursSections = [
  { key: 'liste', label: 'Liste', icon: List },
]

const contenuSections = [
  { path: '/admin/contenu', label: 'Contenu', icon: Layers },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const ok = isAdmin()
  const isEtablissement = location.pathname.startsWith('/admin/etablissement')
  const isEtudiants = location.pathname.startsWith('/admin/etudiants')
  const isBibliothecaires = location.pathname.startsWith('/admin/bibliothecaires')
  const isProfesseurs = location.pathname.startsWith('/admin/professeurs')
  const isContenu = location.pathname.startsWith('/admin/contenu')
  const [etablissementOpen, setEtablissementOpen] = useState(isEtablissement)
  const [etudiantsOpen, setEtudiantsOpen] = useState(isEtudiants)
  const [bibliothecairesOpen, setBibliothecairesOpen] = useState(isBibliothecaires)
  const [professeursOpen, setProfesseursOpen] = useState(isProfesseurs)
  const [contenuOpen, setContenuOpen] = useState(isContenu)
  const [sidebarOpen, toggleSidebar] = useSidebarState()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (isEtablissement) setEtablissementOpen(true)
  }, [isEtablissement])
  useEffect(() => {
    if (isEtudiants) setEtudiantsOpen(true)
  }, [isEtudiants])
  useEffect(() => {
    if (isBibliothecaires) setBibliothecairesOpen(true)
  }, [isBibliothecaires])
  useEffect(() => {
    if (isProfesseurs) setProfesseursOpen(true)
  }, [isProfesseurs])
  useEffect(() => {
    if (isContenu) setContenuOpen(true)
  }, [isContenu])

  useEffect(() => {
    if (!ok) {
      navigate('/login', { replace: true })
    }
  }, [ok, navigate])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  function handleLogout() {
    clearAuth()
    navigate('/login', { replace: true })
  }

  if (!ok) {
    return null
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-5 dark:border-gray-700">
        <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
          <span className="text-[var(--color-esi-primary)]">ESI</span> Admin
        </span>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-gray-700 dark:hover:text-white md:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <div className="hidden md:block">
            <SidebarCloseButton onClick={toggleSidebar} />
          </div>
        </div>
      </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          <NavLink to="/admin" end className={navClass}>
            <LayoutDashboard className="h-5 w-5" strokeWidth={1.5} />
            Tableau de bord
          </NavLink>
          <div className="my-2 border-t border-slate-200 pt-2 dark:border-gray-700">
            <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Gestion
            </p>
          </div>
          {/* Accordéon Gestion des étudiants */}
          <div className="rounded-lg">
            <button
              type="button"
              onClick={() => setEtudiantsOpen((o) => !o)}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                isEtudiants
                  ? 'bg-[var(--color-esi-primary-light)] text-[var(--color-esi-primary)] dark:bg-esi-primary/20 dark:text-esi-primary'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5" strokeWidth={1.5} />
                Gestion des étudiants
              </span>
              {etudiantsOpen ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
            </button>
            {etudiantsOpen && (
              <div className="ml-4 mt-0.5 space-y-0.5 border-l border-slate-200 pl-2 dark:border-gray-600">
                {etudiantsSections.map(({ key, label, icon: Icon }) => (
                  <NavLink
                    key={key}
                    to={`/admin/etudiants/${key}`}
                    className={({ isActive }) =>
                      'flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition ' +
                      (isActive
                        ? 'bg-[var(--color-esi-primary-light)] text-[var(--color-esi-primary)] dark:bg-esi-primary/20 dark:text-esi-primary'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-gray-700 dark:hover:text-white')
                    }
                  >
                    {Icon && <Icon className="h-4 w-4" strokeWidth={1.5} />}
                    {label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
          {/* Accordéon Gestion bibliothécaire */}
          <div className="rounded-lg">
            <button
              type="button"
              onClick={() => setBibliothecairesOpen((o) => !o)}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                isBibliothecaires
                  ? 'bg-[var(--color-esi-primary-light)] text-[var(--color-esi-primary)] dark:bg-esi-primary/20 dark:text-esi-primary'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <BookMarked className="h-5 w-5" strokeWidth={1.5} />
                Gestion bibliothécaire
              </span>
              {bibliothecairesOpen ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
            </button>
            {bibliothecairesOpen && (
              <div className="ml-4 mt-0.5 space-y-0.5 border-l border-slate-200 pl-2 dark:border-gray-600">
                {bibliothecairesSections.map(({ key, label, icon: Icon }) => (
                  <NavLink
                    key={key}
                    to={`/admin/bibliothecaires/${key}`}
                    className={({ isActive }) =>
                      'flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition ' +
                      (isActive
                        ? 'bg-[var(--color-esi-primary-light)] text-[var(--color-esi-primary)] dark:bg-esi-primary/20 dark:text-esi-primary'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-gray-700 dark:hover:text-white')
                    }
                  >
                    {Icon && <Icon className="h-4 w-4" strokeWidth={1.5} />}
                    {label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
          {/* Accordéon Gestion des professeurs */}
          <div className="rounded-lg">
            <button
              type="button"
              onClick={() => setProfesseursOpen((o) => !o)}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                isProfesseurs
                  ? 'bg-[var(--color-esi-primary-light)] text-[var(--color-esi-primary)] dark:bg-esi-primary/20 dark:text-esi-primary'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <UserCircle className="h-5 w-5" strokeWidth={1.5} />
                Gestion des professeurs
              </span>
              {professeursOpen ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
            </button>
            {professeursOpen && (
              <div className="ml-4 mt-0.5 space-y-0.5 border-l border-slate-200 pl-2 dark:border-gray-600">
                {professeursSections.map(({ key, label, icon: Icon }) => (
                  <NavLink
                    key={key}
                    to={`/admin/professeurs/${key}`}
                    className={({ isActive }) =>
                      'flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition ' +
                      (isActive
                        ? 'bg-[var(--color-esi-primary-light)] text-[var(--color-esi-primary)] dark:bg-esi-primary/20 dark:text-esi-primary'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-gray-700 dark:hover:text-white')
                    }
                  >
                    {Icon && <Icon className="h-4 w-4" strokeWidth={1.5} />}
                    {label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
          <NavLink to="/admin/utilisateurs" className={navClass}>
            <Users className="h-5 w-5" strokeWidth={1.5} />
            Gestion des utilisateurs
          </NavLink>
          <NavLink to="/admin/administration" className={navClass}>
            <Building2 className="h-5 w-5" strokeWidth={1.5} />
            Gestion de l&apos;administration
          </NavLink>
          {/* Accordéon Gestion de l'établissement (BSA) avec sous-liens */}
          <div className="rounded-lg">
            <button
              type="button"
              onClick={() => setEtablissementOpen((o) => !o)}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                isEtablissement
                  ? 'bg-[var(--color-esi-primary-light)] text-[var(--color-esi-primary)] dark:bg-esi-primary/20 dark:text-esi-primary'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <School className="h-5 w-5" strokeWidth={1.5} />
                Gestion de l&apos;établissement
              </span>
              {etablissementOpen ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
            </button>
            {etablissementOpen && (
              <div className="ml-4 mt-0.5 space-y-0.5 border-l border-slate-200 pl-2 dark:border-gray-600">
                {etablissementSections.map(({ key, label, icon: Icon }) => (
                    <NavLink
                      key={key}
                      to={`/admin/etablissement/${key}`}
                      className={({ isActive }) =>
'flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition ' +
                      (isActive
                        ? 'bg-[var(--color-esi-primary-light)] text-[var(--color-esi-primary)] dark:bg-esi-primary/20 dark:text-esi-primary'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-gray-700 dark:hover:text-white')
                    }
                    >
                      {Icon && <Icon className="h-4 w-4" strokeWidth={1.5} />}
                      {label}
                    </NavLink>
                ))}
              </div>
            )}
          </div>
          {/* Accordéon Contenu */}
          <div className="rounded-lg">
            <button
              type="button"
              onClick={() => setContenuOpen((o) => !o)}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                isContenu
                  ? 'bg-[var(--color-esi-primary-light)] text-[var(--color-esi-primary)] dark:bg-esi-primary/20 dark:text-esi-primary'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <Layers className="h-5 w-5" strokeWidth={1.5} />
                Contenu
              </span>
              {contenuOpen ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
            </button>
            {contenuOpen && contenuSections.length > 0 && (
              <div className="ml-4 mt-0.5 space-y-0.5 border-l border-slate-200 pl-2 dark:border-gray-600">
                {contenuSections.map(({ path, label, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                      'flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition ' +
                      (isActive
                        ? 'bg-[var(--color-esi-primary-light)] text-[var(--color-esi-primary)] dark:bg-esi-primary/20 dark:text-esi-primary'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-gray-700 dark:hover:text-white')
                    }
                  >
                    {Icon && <Icon className="h-4 w-4" strokeWidth={1.5} />}
                    {label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
          <div className="my-2 border-t border-slate-200 pt-2 dark:border-gray-700">
            <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Configuration
            </p>
          </div>
          <NavLink to="/admin/parametres" className={navClass}>
            <Settings className="h-5 w-5" strokeWidth={1.5} />
            Paramètres
          </NavLink>
        </nav>
          <div className="border-t border-slate-200 p-3 dark:border-gray-700">
            {(() => {
              const auth = getAuth()
              const user = auth?.user
              const poste = user?.poste
              return (
                <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 dark:text-slate-300">
                  <UserCircle className="h-9 w-9 shrink-0 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                      {user?.email || user?.username || 'Administration'}
                    </p>
                    {poste && (
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">{poste}</p>
                    )}
                  </div>
                </div>
              )
            })()}
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
      {!sidebarOpen && (
        <div className="fixed left-4 top-4 z-40 hidden md:block">
          <SidebarOpenButton onClick={toggleSidebar} className="bg-white shadow-md dark:bg-gray-800" />
        </div>
      )}
      {/* Bouton hamburger mobile */}
      <div className="fixed left-3 top-3 z-50 md:hidden">
        {!mobileOpen && (
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg bg-white p-2 shadow-md transition hover:bg-slate-50 dark:bg-gray-800 dark:hover:bg-gray-700"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </button>
        )}
      </div>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar mobile (drawer) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out md:hidden dark:border-gray-700 dark:bg-gray-800 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>

      {/* Sidebar desktop */}
      <aside className={`hidden md:flex shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 dark:border-gray-700 dark:bg-gray-800 ${sidebarOpen ? 'w-56' : 'w-0 overflow-hidden border-r-0'}`}>
        {sidebarOpen && <div className="w-56 min-w-56 flex-1 flex-col">{sidebarContent}</div>}
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  )
}
