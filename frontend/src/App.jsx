import { Routes, Route, Navigate } from 'react-router-dom'
import {
  PublicLayout,
  LandingPage,
  VieEstudiantinePage,
  DocumentsPage,
  AProposPage,
  EnseignantsPage,
  LoginPage,
  ChangerMotDePassePage,
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
  StudentLayout,
  StudentDashboard,
  StudentCours,
  StudentDocuments,
  StudentEmploiDuTemps,
  StudentProfil,
  BibliothecaireLayout,
  BibliothecaireDashboard,
  ProfesseurLayout,
  ProfesseurDashboard,
  AdministrationLayout,
  AdministrationDashboard,
} from './multi-page'
import './App.css'

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/vie-estudiantine" element={<VieEstudiantinePage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/a-propos" element={<AProposPage />} />
        <Route path="/enseignants" element={<EnseignantsPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
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
          <Route path="creation" element={<AdminEtudiantsCreation />} />
          <Route path="recherche" element={<AdminEtudiantsRecherche />} />
          <Route path="liste" element={<AdminEtudiantsListe />} />
        </Route>
        <Route path="bibliothecaires">
          <Route index element={<Navigate to="/admin/bibliothecaires/liste" replace />} />
          <Route path="liste" element={<AdminBibliothecairesListe />} />
          <Route path="creation" element={<AdminBibliothecairesCreation />} />
        </Route>
        <Route path="professeurs">
          <Route index element={<Navigate to="/admin/professeurs/liste" replace />} />
          <Route path="liste" element={<AdminProfesseursListe />} />
          <Route path="creation" element={<AdminProfesseursCreation />} />
        </Route>
        <Route path="contenu" element={<AdminContenu />} />
        <Route path="administration" element={<AdminAdministration />} />
        <Route path="parametres" element={<AdminParametres />} />
        <Route path="etablissement">
          <Route index element={<Navigate to="/admin/etablissement/annees" replace />} />
          <Route path=":section" element={<AdminEtablissement />} />
        </Route>
      </Route>

      {/* Ajouter ici les autres routes au fur et à mesure */}
    </Routes>
  )
}

export default App
