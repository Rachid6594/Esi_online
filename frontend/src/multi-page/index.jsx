/**
 * Multi-page : export central des pages de l'application.
 * Ajouter ici les nouvelles pages au fur et à mesure.
 */
export {
  LandingPage,
  PublicLayout,
  VieEstudiantinePage,
  DocumentsPage,
  AProposPage,
  EnseignantsPage,
  NotFoundPage,
} from './landing'
export { LoginPage, RegisterPage, ChangerMotDePassePage } from './auth'
export {
  AdminLayout,
  AdminDashboard,
  AdminEtudiantsDashboard,
  AdminBibliothecairesListe,
  AdminProfesseursListe,
  AdminContenu,
  AdminUtilisateurs,
  AdminAdministration,
  AdminParametres,
  AdminEtablissement,
  AdminUploadPermissions,
  AdminBibliotheque,
} from './espace-admin'
export {
  StudentLayout,
  StudentDashboard,
  StudentCours,
  StudentDocuments,
  StudentEmploiDuTemps,
  StudentProfil,
} from './espace-student'
export {
  BibliothecaireLayout,
  BibliothecaireDashboard,
} from './espace-bibliotheque'
export {
  ProfesseurLayout,
  ProfesseurDashboard,
} from './espace-prof'
export {
  AdministrationLayout,
  AdministrationDashboard,
} from './espace-administration'
