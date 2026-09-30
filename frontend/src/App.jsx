import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import {
  PublicLayout,
  LandingPage,
  StudentLayout,
  AdminLayout,
  BibliothecaireLayout,
  ProfesseurLayout,
  AdministrationLayout,
  LoginPage,
  NotFoundPage,
} from './multi-page'

/**
 * Chaque page est chargee a la demande.
 *
 * L'import statique de `./multi-page` tirait les 30 pages dans un seul chunk
 * de 674 Ko : un visiteur qui ouvrait la page d'accueil telechargeait aussi
 * l'espace admin, la bibliotheque et l'interface des profs. Les pages rares
 * restent rares, et le layout reste dans le chunk principal : le navigation
 * entre les onglets d'un espace ne recharge rien.
 */
const VieEstudiantinePage = lazy(() => import('./multi-page').then((m) => ({ default: m.VieEstudiantinePage })))
const DocumentsPage = lazy(() => import('./multi-page').then((m) => ({ default: m.DocumentsPage })))
const AProposPage = lazy(() => import('./multi-page').then((m) => ({ default: m.AProposPage })))
const EnseignantsPage = lazy(() => import('./multi-page').then((m) => ({ default: m.EnseignantsPage })))
const RegisterPage = lazy(() => import('./multi-page').then((m) => ({ default: m.RegisterPage })))
const ChangerMotDePassePage = lazy(() => import('./multi-page').then((m) => ({ default: m.ChangerMotDePassePage })))

const StudentDashboard = lazy(() => import('./multi-page').then((m) => ({ default: m.StudentDashboard })))
const StudentCours = lazy(() => import('./multi-page').then((m) => ({ default: m.StudentCours })))
const StudentDocuments = lazy(() => import('./multi-page').then((m) => ({ default: m.StudentDocuments })))
const StudentEmploiDuTemps = lazy(() => import('./multi-page').then((m) => ({ default: m.StudentEmploiDuTemps })))
const StudentProfil = lazy(() => import('./multi-page').then((m) => ({ default: m.StudentProfil })))

const BibliothecaireDashboard = lazy(() => import('./multi-page').then((m) => ({ default: m.BibliothecaireDashboard })))
const ProfesseurDashboard = lazy(() => import('./multi-page').then((m) => ({ default: m.ProfesseurDashboard })))
const AdministrationDashboard = lazy(() => import('./multi-page').then((m) => ({ default: m.AdministrationDashboard })))

const AdminDashboard = lazy(() => import('./multi-page').then((m) => ({ default: m.AdminDashboard })))
const AdminEtudiantsDashboard = lazy(() => import('./multi-page').then((m) => ({ default: m.AdminEtudiantsDashboard })))
const AdminBibliothecairesListe = lazy(() => import('./multi-page').then((m) => ({ default: m.AdminBibliothecairesListe })))
const AdminProfesseursListe = lazy(() => import('./multi-page').then((m) => ({ default: m.AdminProfesseursListe })))
const AdminContenu = lazy(() => import('./multi-page').then((m) => ({ default: m.AdminContenu })))
const AdminAdministration = lazy(() => import('./multi-page').then((m) => ({ default: m.AdminAdministration })))
const AdminParametres = lazy(() => import('./multi-page').then((m) => ({ default: m.AdminParametres })))
const AdminEtablissement = lazy(() => import('./multi-page').then((m) => ({ default: m.AdminEtablissement })))
const AdminUploadPermissions = lazy(() => import('./multi-page').then((m) => ({ default: m.AdminUploadPermissions })))

function Chargement() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
      <span className="text-sm text-muted-foreground">Chargement…</span>
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<Chargement />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/vie-estudiantine" element={<VieEstudiantinePage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/a-propos" element={<AProposPage />} />
          <Route path="/enseignants" element={<EnseignantsPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/inscription" element={<RegisterPage />} />
        <Route path="/changer-mot-de-passe" element={<ChangerMotDePassePage />} />
        <Route path="/home" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="cours" element={<StudentCours />} />
          <Route path="documents" element={<StudentDocuments />} />
          <Route path="emploi-du-temps" element={<StudentEmploiDuTemps />} />
          <Route path="profil" element={<StudentProfil />} />
        </Route>

        <Route path="/bibliotheque" element={<BibliothecaireLayout />}>
          <Route index element={<BibliothecaireDashboard />} />
        </Route>

        <Route path="/prof" element={<ProfesseurLayout />}>
          <Route index element={<ProfesseurDashboard />} />
        </Route>

        {/* Administration de l'école (membres avec poste) — dashboard distinct de l'admin site */}
        <Route path="/administration" element={<AdministrationLayout />}>
          <Route index element={<AdministrationDashboard />} />
        </Route>

        {/* Admin du site (superuser uniquement) */}
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="etudiants">
            <Route index element={<Navigate to="/admin/etudiants/dashboard" replace />} />
            <Route path="dashboard" element={<AdminEtudiantsDashboard />} />
            <Route path="promouvoir" element={<AdminUploadPermissions />} />
            <Route path="upload" element={<Navigate to="/admin/etudiants/promouvoir" replace />} />
            <Route path="creation" element={<Navigate to="/admin/etudiants/dashboard" replace />} />
            <Route path="recherche" element={<Navigate to="/admin/etudiants/dashboard" replace />} />
            <Route path="liste" element={<Navigate to="/admin/etudiants/dashboard" replace />} />
          </Route>
          <Route path="bibliothecaires">
            <Route index element={<Navigate to="/admin/bibliothecaires/liste" replace />} />
            <Route path="liste" element={<AdminBibliothecairesListe />} />
            <Route path="creation" element={<Navigate to="/admin/bibliothecaires/liste" replace />} />
          </Route>
          <Route path="professeurs">
            <Route index element={<Navigate to="/admin/professeurs/liste" replace />} />
            <Route path="liste" element={<AdminProfesseursListe />} />
            <Route path="creation" element={<Navigate to="/admin/professeurs/liste" replace />} />
          </Route>
          <Route path="contenu" element={<AdminContenu />} />
          <Route path="utilisateurs" element={<Navigate to="/admin/parametres/utilisateurs" replace />} />
          <Route path="administration" element={<AdminAdministration />} />
          <Route path="parametres">
            <Route index element={<Navigate to="/admin/parametres/utilisateurs" replace />} />
            <Route path=":section" element={<AdminParametres />} />
          </Route>
          <Route path="etablissement">
            <Route index element={<Navigate to="/admin/etablissement/annees" replace />} />
            <Route path=":section" element={<AdminEtablissement />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default App
