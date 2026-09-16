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
  UserPlus,
  Shield,
  KeyRound,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { getAuth, clearAuth, isAdmin } from '../../auth'
import { ThemeToggle } from '../../components/ThemeToggle'
import { useSidebarState, SidebarCloseButton, SidebarOpenButton } from '../../components/SidebarToggle'
import { Button } from '@/components/ui/button'

const navClass = ({ isActive }) =>
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ' +
  (isActive
    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground')

const subNavClass = ({ isActive }) =>
  'flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition ' +
  (isActive
    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
    : 'text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground')

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
  { key: 'promouvoir', label: 'Promouvoir étudiant', icon: UserPlus },
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

const parametresSections = [
  { key: 'utilisateurs', label: 'Utilisateurs', icon: Users },
  { key: 'roles', label: 'Rôles', icon: Shield },
  { key: 'permissions', label: 'Permissions', icon: KeyRound },
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
  const isParametres = location.pathname.startsWith('/admin/parametres')
  const [etablissementOpen, setEtablissementOpen] = useState(isEtablissement)
  const [etudiantsOpen, setEtudiantsOpen] = useState(isEtudiants)
  const [bibliothecairesOpen, setBibliothecairesOpen] = useState(isBibliothecaires)
  const [professeursOpen, setProfesseursOpen] = useState(isProfesseurs)
  const [contenuOpen, setContenuOpen] = useState(isContenu)
  const [parametresOpen, setParametresOpen] = useState(isParametres)
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
    if (isParametres) setParametresOpen(true)
  }, [isParametres])

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

  const accordionBtn = (active) =>
    `flex h-auto w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium text-sidebar-foreground ${
      active
        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
        : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
    }`

  const sidebarContent = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-5">
        <span className="truncate font-semibold text-sidebar-foreground">ESI Admin</span>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="text-sidebar-foreground md:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </Button>
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
        <div className="my-2 border-t border-sidebar-border pt-2">
          <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Gestion
          </p>
        </div>
        <div className="rounded-lg">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setEtudiantsOpen((o) => !o)}
            className={accordionBtn(isEtudiants)}
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
          </Button>
          {etudiantsOpen && (
            <div className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-2">
              {etudiantsSections.map(({ key, label, icon: Icon }) => (
                <NavLink key={key} to={`/admin/etudiants/${key}`} className={subNavClass}>
                  {Icon && <Icon className="h-4 w-4" strokeWidth={1.5} />}
                  {label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-lg">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setBibliothecairesOpen((o) => !o)}
            className={accordionBtn(isBibliothecaires)}
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
          </Button>
          {bibliothecairesOpen && (
            <div className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-2">
              {bibliothecairesSections.map(({ key, label, icon: Icon }) => (
                <NavLink key={key} to={`/admin/bibliothecaires/${key}`} className={subNavClass}>
                  {Icon && <Icon className="h-4 w-4" strokeWidth={1.5} />}
                  {label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-lg">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setProfesseursOpen((o) => !o)}
            className={accordionBtn(isProfesseurs)}
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
          </Button>
          {professeursOpen && (
            <div className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-2">
              {professeursSections.map(({ key, label, icon: Icon }) => (
                <NavLink key={key} to={`/admin/professeurs/${key}`} className={subNavClass}>
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
        <div className="rounded-lg">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setEtablissementOpen((o) => !o)}
            className={accordionBtn(isEtablissement)}
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
          </Button>
          {etablissementOpen && (
            <div className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-2">
              {etablissementSections.map(({ key, label, icon: Icon }) => (
                <NavLink key={key} to={`/admin/etablissement/${key}`} className={subNavClass}>
                  {Icon && <Icon className="h-4 w-4" strokeWidth={1.5} />}
                  {label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-lg">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setContenuOpen((o) => !o)}
            className={accordionBtn(isContenu)}
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
          </Button>
          {contenuOpen && contenuSections.length > 0 && (
            <div className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-2">
              {contenuSections.map(({ path, label, icon: Icon }) => (
                <NavLink key={path} to={path} className={subNavClass}>
                  {Icon && <Icon className="h-4 w-4" strokeWidth={1.5} />}
                  {label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
        <div className="my-2 border-t border-sidebar-border pt-2">
          <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Configuration
          </p>
        </div>
        <div className="rounded-lg">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setParametresOpen((o) => !o)}
            className={accordionBtn(isParametres)}
          >
            <span className="flex items-center gap-3">
              <Settings className="h-5 w-5" strokeWidth={1.5} />
              Paramètres · IAM
            </span>
            {parametresOpen ? (
              <ChevronDown className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" />
            )}
          </Button>
          {parametresOpen && (
            <div className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-2">
              {parametresSections.map(({ key, label, icon: Icon }) => (
                <NavLink key={key} to={`/admin/parametres/${key}`} className={subNavClass}>
                  {Icon && <Icon className="h-4 w-4" strokeWidth={1.5} />}
                  {label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>
      <div className="border-t border-sidebar-border p-3">
        {(() => {
          const auth = getAuth()
          const user = auth?.user
          const poste = user?.poste
          return (
            <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/70">
              <UserCircle className="h-9 w-9 shrink-0 text-sidebar-foreground/50" strokeWidth={1.5} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {user?.email || user?.username || 'Administration'}
                </p>
                {poste && <p className="truncate text-xs text-sidebar-foreground/50">{poste}</p>}
              </div>
            </div>
          )
        })()}
        <Button
          type="button"
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 px-3 py-2.5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-5 w-5" strokeWidth={1.5} />
          Déconnexion
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      {!sidebarOpen && (
        <div className="fixed left-4 top-4 z-40 hidden md:block">
          <SidebarOpenButton onClick={toggleSidebar} className="bg-card shadow-md" />
        </div>
      )}
      <div className="fixed left-3 top-3 z-50 md:hidden">
        {!mobileOpen && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="bg-background shadow-md"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      <aside
        className={`hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:flex ${
          sidebarOpen ? 'w-56' : 'w-0 overflow-hidden border-r-0'
        }`}
      >
        {sidebarOpen && <div className="flex w-56 min-w-56 flex-1 flex-col">{sidebarContent}</div>}
      </aside>

      <main className="flex-1 overflow-auto bg-background pt-14 text-foreground md:pt-0">
        <Outlet />
      </main>
    </div>
  )
}
