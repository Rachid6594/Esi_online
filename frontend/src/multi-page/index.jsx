/**
 * Multi-page : export central des pages de l'application.
 * Ajouter ici les nouvelles pages au fur et à mesure.
 */
export { default as HomePage } from './HomePage'
export { LandingPage } from './landing'
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
