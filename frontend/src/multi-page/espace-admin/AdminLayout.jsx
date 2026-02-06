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
  UserPlus,
  Search,
  List,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { getAuth, clearAuth, isAdmin } from '../../auth'

const navClass = ({ isActive }) =>
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ' +
  (isActive
    ? 'bg-[var(--color-esi-primary-light)] text-[var(--color-esi-primary)]'
    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')

const etablissementSections = [
  { key: 'annees', label: 'Années académiques', icon: Calendar },
  { key: 'niveaux', label: 'Niveaux', icon: Layers },
  { key: 'filieres', label: 'Filières', icon: BookOpen },
  { key: 'classes', label: 'Classes', icon: GraduationCap },
  { key: 'matieres', label: 'Matières', icon: BookMarkedIcon },
  { key: 'adminEcoles', label: 'Administration École', icon: Users },
]

const etudiantsSections = [
  { key: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { key: 'creation', label: 'Création', icon: UserPlus },
  { key: 'recherche', label: 'Recherche avancée', icon: Search },
  { key: 'liste', label: 'Liste', icon: List },
]

const bibliothecairesSections = [
  { key: 'liste', label: 'Liste', icon: List },
  { key: 'creation', label: 'Créer un compte', icon: UserPlus },
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
  const isContenu = location.pathname.startsWith('/admin/contenu')
  const [etablissementOpen, setEtablissementOpen] = useState(isEtablissement)
  const [etudiantsOpen, setEtudiantsOpen] = useState(isEtudiants)
  const [bibliothecairesOpen, setBibliothecairesOpen] = useState(isBibliothecaires)
  const [contenuOpen, setContenuOpen] = useState(isContenu)

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
    if (isContenu) setContenuOpen(true)
  }, [isContenu])

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

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-5">
          <span className="font-semibold text-slate-800">
            <span className="text-[var(--color-esi-primary)]">ESI</span> Admin
          </span>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          <NavLink to="/admin" end className={navClass}>
            <LayoutDashboard className="h-5 w-5" strokeWidth={1.5} />
            Tableau de bord
          </NavLink>
          <div className="my-2 border-t border-slate-200 pt-2">
            <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
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
                  ? 'bg-[var(--color-esi-primary-light)] text-[var(--color-esi-primary)]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
              <div className="ml-4 mt-0.5 space-y-0.5 border-l border-slate-200 pl-2">
                {etudiantsSections.map(({ key, label, icon: Icon }) => (
                  <NavLink
                    key={key}
                    to={`/admin/etudiants/${key}`}
                    className={({ isActive }) =>
                      'flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition ' +
                      (isActive
                        ? 'bg-[var(--color-esi-primary-light)] text-[var(--color-esi-primary)]'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
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
                  ? 'bg-[var(--color-esi-primary-light)] text-[var(--color-esi-primary)]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
              <div className="ml-4 mt-0.5 space-y-0.5 border-l border-slate-200 pl-2">
                {bibliothecairesSections.map(({ key, label, icon: Icon }) => (
                  <NavLink
                    key={key}
                    to={`/admin/bibliothecaires/${key}`}
                    className={({ isActive }) =>
                      'flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition ' +
                      (isActive
                        ? 'bg-[var(--color-esi-primary-light)] text-[var(--color-esi-primary)]'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                    }
                  >
                    {Icon && <Icon className="h-4 w-4" strokeWidth={1.5} />}
                    {label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
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
                  ? 'bg-[var(--color-esi-primary-light)] text-[var(--color-esi-primary)]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
              <div className="ml-4 mt-0.5 space-y-0.5 border-l border-slate-200 pl-2">
                {etablissementSections.map(({ key, label, icon: Icon }) => (
                    <NavLink
                      key={key}
                      to={`/admin/etablissement/${key}`}
                      className={({ isActive }) =>
                        'flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition ' +
                        (isActive
                          ? 'bg-[var(--color-esi-primary-light)] text-[var(--color-esi-primary)]'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
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
                  ? 'bg-[var(--color-esi-primary-light)] text-[var(--color-esi-primary)]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
              <div className="ml-4 mt-0.5 space-y-0.5 border-l border-slate-200 pl-2">
                {contenuSections.map(({ path, label, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                      'flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition ' +
                      (isActive
                        ? 'bg-[var(--color-esi-primary-light)] text-[var(--color-esi-primary)]'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                    }
                  >
                    {Icon && <Icon className="h-4 w-4" strokeWidth={1.5} />}
                    {label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
          <div className="my-2 border-t border-slate-200 pt-2">
            <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Configuration
            </p>
          </div>
          <NavLink to="/admin/parametres" className={navClass}>
            <Settings className="h-5 w-5" strokeWidth={1.5} />
            Paramètres
          </NavLink>
        </nav>
        <div className="border-t border-slate-200 p-3">
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
