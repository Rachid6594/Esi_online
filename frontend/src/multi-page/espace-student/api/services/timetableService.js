import { apiGet } from '../axiosConfig'
import { ENDPOINTS } from '../endpoints'

/**
 * Récupère l'emploi du temps de l'étudiant.
 * @returns {Promise<Array>}
 */
export async function getTimetable() {
  return (await apiGet(ENDPOINTS.TIMETABLE)) || []
}
