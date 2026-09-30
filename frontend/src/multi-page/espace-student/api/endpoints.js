/**
 * Centralisation de tous les endpoints API de l'espace étudiant.
 * Pointe vers les endpoints réels du backend Django (OpenAPI).
 */
export const ENDPOINTS = {
  // Cours (Matières)
  COURSES: '/api/etablissement/matieres/',
  COURSE_DETAIL: (id) => `/api/etablissement/matieres/${id}/`,

  // Emploi du temps
  TIMETABLE: '/api/etablissement/emploidutempss/',

  // Ressources / Documents
  // L'espace étudiant lisait RESOURCES ci-dessous, l'endpoint d'administration
  // : liste non triée par visibilité, ids bruts dans le payload. DOCUMENTS est
  // l'endpoint de l'espace, qui applique la règle de visibilité.
  DOCUMENTS: '/api/eleve/documents/',
  DOCUMENT_TYPES: '/api/eleve/documents/types/',
  DOCUMENT_DOWNLOAD: (id) => `/api/eleve/documents/${id}/telecharger/`,
  UPLOAD_TYPES: '/api/eleve/upload-types/',

  // Notifications (Annonces)
  NOTIFICATIONS: '/api/etablissement/annonces/',

  // Profil utilisateur courant
  PROFILE: '/api/auth/me/',
}
