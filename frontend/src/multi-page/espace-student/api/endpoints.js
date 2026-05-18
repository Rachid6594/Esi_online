/**
 * Centralisation de tous les endpoints API de l'espace étudiant.
 */
export const ENDPOINTS = {
  // Cours
  COURSES: '/api/student/courses',
  COURSE_DETAIL: (id) => `/api/student/courses/${id}`,
  COURSE_CONTENT: (id) => `/api/student/courses/${id}/content`,

  // Emploi du temps
  TIMETABLE: '/api/student/timetable',

  // Ressources / Documents
  RESOURCES: '/api/resources',
  RESOURCE_DETAIL: (id) => `/api/resources/${id}`,
  RESOURCE_DOWNLOAD: (id) => `/api/resources/${id}/download`,

  // Notifications
  NOTIFICATIONS: '/api/notifications',

  // Profil
  PROFILE_UPDATE: '/api/student/profile',
}
