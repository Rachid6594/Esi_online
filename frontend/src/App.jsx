import { Routes, Route, Navigate } from 'react-router-dom'
import {
  LandingPage,
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
} from './multi-page'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
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

      {/* Une seule connexion : /login ; redirection par rôle (admin / bibliothecaire / home) */}
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
