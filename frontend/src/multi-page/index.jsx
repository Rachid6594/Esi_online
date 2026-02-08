/**
 * Multi-page : export central des pages de l'application.
 * Ajouter ici les nouvelles pages au fur et à mesure.
 */
export { default as HomePage } from './HomePage'
export {
  LandingPage,
  PublicLayout,
  VieEstudiantinePage,
  DocumentsPage,
  AProposPage,
  EnseignantsPage,
} from './landing'
export { LoginPage, ChangerMotDePassePage } from './auth'
export {
  AdminLayout,
  AdminDashboard,
  AdminEtudiantsDashboard,
  AdminEtudiantsCreation,
  AdminEtudiantsRecherche,
  AdminEtudiantsListe,
  AdminBibliothecairesListe,
  AdminBibliothecairesCreation,
  AdminProfesseursListe,
  AdminProfesseursCreation,
  AdminContenu,
  AdminAdministration,
  AdminParametres,
  AdminEtablissement,
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
