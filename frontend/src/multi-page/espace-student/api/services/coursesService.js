import { apiGet } from '../axiosConfig'
import { ENDPOINTS } from '../endpoints'

/**
 * Récupère la liste des cours de l'étudiant.
 * @returns {Promise<Array>}
 */
export async function getCourses() {
  return (await apiGet(ENDPOINTS.COURSES)) || []
}

/**
 * Récupère le détail d'un cours (infos + contenu).
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getCourseDetail(id) {
  return apiGet(ENDPOINTS.COURSE_DETAIL(id))
}

/**
 * Récupère le contenu pédagogique d'un cours.
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getCourseContent(id) {
  return apiGet(ENDPOINTS.COURSE_CONTENT(id))
}
