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
  RESOURCES: '/api/etablissement/ressources/',
  RESOURCE_DETAIL: (id) => `/api/etablissement/ressources/${id}/`,

  // Notifications (Annonces)
  NOTIFICATIONS: '/api/etablissement/annonces/',

  // Profil utilisateur courant
  PROFILE: '/api/auth/me/',
}
